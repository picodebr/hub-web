import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { GetServerSideProps } from 'next';
import * as Yup from 'yup';
import { Container } from './styles';

import { Simulator } from '../../../components/Simulator';
import { SimulatorCodeHandler } from '../../../components/Simulator/interfaces';
import { scratchState } from '../../../components/scratch/ScratchState';
import { CodeEditor } from '../../../components/CodeEditor';
import { ICodeEditorError } from '../../../components/CodeEditor/interfaces';
import { useCustomRouter, useCustomToast, useLoading } from '../../../_base/hooks';
import { IProject, IProjectSourceCode } from '@/_base/interfaces/codeProject/IProject';
import { IProjectFolder, IProjectFolderListingItem } from '@/_base/interfaces/codeFolder/IProjectFolder';
import { supportedBoards } from '@/_base/interfaces/boards/supported';
import { usbVendorIds } from '@/_base/config/usbVendorIds';
import {
  SerialConnection,
  cookieManager,
  delay,
  getEditorErrors,
  getValidationError,
  parseSourceCode,
  showErrorToClient,
  stk,
  supportSerialAPI,
  writeSerialCode,
} from '@/_base/utils';
import { AppStatus } from '@/_base/interfaces/appStatus/AppStatus';
import { ICompiledCode } from '@/_base/interfaces/code/ICode';
import { headerEvents } from '@/components/Page/components/Header/HeaderEvents';
import { uploadConfig } from '@/_base/config/upload';
import { compileCode } from '@/_base/services/compile/compileCode';
import { ICreateProjectParams } from '@/_base/interfaces/codeProject/ICreateProjectParams';
import { dimensions } from '@/styles/global';
import { createProjectFolder } from '@/_base/services/projectFolder/createProjectFolder';
import { createProject } from '@/_base/services/codeProject/createProject';
import { updateProject } from '@/_base/services/codeProject/updateProject';
import { listProjectFolders } from '@/_base/services/projectFolder/listProjectFolders';
import { StatusModal } from '@/components/Modal/Status';
import { GenericModal } from '@/components/Modal/GenericModal';
import { Project } from './components/Project';
import { SimulationCodeModal } from '@/components/Modal/SimulationCodeModal';
import { SerialMonitor } from '@/components/Modal/SerialMonitor';
import { EditorModeModal } from '@/components/Modal/EditorModeModal';
import { IHubUser } from '@/_base/interfaces/user';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { Flex } from '@chakra-ui/react';

const getDefaultSourceCode = (project: IProject | null) =>
  project?.source_code ||
  ({
    code: '',
    mode: 'block',
    simulation_elements_layout: [],
    variables: [],
  } as IProjectSourceCode);

interface IProps {
  user: IHubUser | null;
  project: IProject | null;
  folder: IProjectFolder | null;
  folders: IProjectFolderListingItem[];
  isDefaultProject: boolean;
  iframeUrl: string;
}

const Code: React.FC<IProps> = ({ user: _user, project: _project, folder: _folder, folders: _folders, isDefaultProject, iframeUrl }) => {
  const sourceCodeRef = useRef(getDefaultSourceCode(_project));
  const board = useMemo(() => supportedBoards[0], []);
  const usbFilters = useMemo(() => usbVendorIds.map((usbVendorId) => ({ usbVendorId })), []);
  const { setLoadingConfig } = useLoading();
  const router = useCustomRouter();
  const toast = useCustomToast();

  const [folder, setFolder] = useState<IProjectFolder | null>(_folder);
  const [folders, setFolders] = useState<IProjectFolderListingItem[]>(_folders);
  const [newFolderName, setNewFolderName] = useState('');

  const [user, setUser] = useState<IHubUser | null>(_user);
  const [project, setProject] = useState<IProject | null>(_project);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showEditorModeModal, setShowEditorModeModal] = useState(false);

  const serial = useMemo(() => new SerialConnection(), []);
  const [appStatus, setAppStatus] = useState<AppStatus>('starting');
  const [compiledCode, setCompiledCode] = useState<ICompiledCode>();

  const [showFormModal, setShowFormModal] = useState(false);
  const [openProjectModal, setOpenProjectModal] = useState(false);

  const [projectName, setProjectName] = useState(_project?.name || '');
  const [projectNameError, setProjectNameError] = useState('');
  const [privateProject, setPrivateProject] = useState(_project?.private || false);

  const [editorErrors, setEditorErrors] = useState<ICodeEditorError[]>([]);

  const [showSerialMonitor, setShowSerialMonitor] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const simulatorCodeHandlerRef = useRef<SimulatorCodeHandler>();

  useEffect(() => {
    const messageHandler: EventListener = (event) => {
      setAppStatus((event as any).data);
    };

    document.addEventListener('message', messageHandler);
    return () => document.removeEventListener('message', messageHandler);
  }, []);

  const handleToText = useCallback(() => {
    setShowEditorModeModal(true);
  }, []);

  const handleEditorModalClose = useCallback((confirmed: boolean) => {
    setShowEditorModeModal(false);
    if (!confirmed) return;

    sourceCodeRef.current.code = parseSourceCode(sourceCodeRef.current, 'cpp');
    sourceCodeRef.current.mode = 'text';
    headerEvents.emit('codemode', 'text');
  }, []);

  const postMessage = useMemo(() => {
    if (typeof window === 'undefined') return undefined;

    const webview = (window as any).ReactNativeWebView;
    return webview?.postMessage.bind(webview);
  }, []);

  useEffect(() => {
    postMessage && postMessage(JSON.stringify({ orientation: 'landscape' }));

    return () => postMessage && postMessage(JSON.stringify({ orientation: 'portrait' }));
  }, [postMessage]);

  const waitForString = useCallback(
    (pattern: string) => {
      return new Promise((res) => {
        let acc = '';

        const getChunk = (content: string | null) => {
          acc += content;

          if (acc.indexOf(pattern) >= 0) {
            res(acc);
            serial.removeListener('chunk', getChunk);
          }
        };

        serial.addListener('chunk', getChunk);
      });
    },
    [serial],
  );

  const waitForDeviceSync = useCallback(
    async () =>
      new Promise<void>((res, rej) => {
        const desc = setTimeout(() => rej(new Error('Upload timeout')), uploadConfig.MAXIMUM_UPLOAD_TIME);

        waitForString(String.fromCharCode(stk.OK))
          .then(() => {
            clearTimeout(desc);
            res();
          })
          .catch(rej);
      }),
    [waitForString],
  );

  const handleCompilation = useCallback(async () => {
    const compiled = await compileCode({
      board_fqbn: board.fqbn,
      code: parseSourceCode(sourceCodeRef.current, 'cpp'),
    });

    setCompiledCode(compiled);
  }, [board.fqbn]);

  const uploadCode = useCallback(
    async (data: number[]) => {
      await delay(uploadConfig.BOOTLOADER_START_DELAY);

      for (let i = 0; i < 3; i += 1) {
        await serial.writeSTKCommands(stk.GET_SYNC);
        await waitForDeviceSync();
      }

      await writeSerialCode(serial, data, waitForDeviceSync);
    },
    [serial, waitForDeviceSync],
  );

  const handleSerialMonitor = useCallback(() => {
    setShowSerialMonitor(true);
  }, []);

  useEffect(() => {
    if (!supportSerialAPI() || !compiledCode) return () => ({});

    const connect = async () => {
      try {
        await serial.connect(
          { baudRate: uploadConfig.DEFAULT_BAUD_RATE },
          usbVendorIds.map((usbVendorId) => ({ usbVendorId })),
        );
        setAppStatus('ready_to_upload');
      } catch {
        setAppStatus('connection_failed');
      }
    };

    connect();

    return () => {
      serial.disconnect();
    };
  }, [compiledCode, serial]);

  useEffect(() => {
    if (!supportSerialAPI() || !compiledCode || appStatus !== 'ready_to_upload') return;

    const upload = async () => {
      try {
        setAppStatus('uploading');

        await uploadCode(compiledCode.build_data);

        setAppStatus('uploaded');
        await delay(uploadConfig.MESSAGE_VISIBILITY_TIME);

        await serial.disconnect();
        setAppStatus('ready_to_compile');
      } catch {
        setAppStatus('upload_failed');
        await delay(uploadConfig.MESSAGE_VISIBILITY_TIME);

        serial.disconnect();
      }
    };

    upload();
  }, [appStatus, compiledCode, serial, uploadCode]);

  useEffect(() => {
    if (!postMessage || !compiledCode) return;

    postMessage(JSON.stringify(compiledCode));
  }, [compiledCode, postMessage]);

  const handleSerialDisconnect = useCallback(() => {
    setAppStatus('ready_to_compile');
  }, []);

  useEffect(() => {
    serial.addListener('disconnect', handleSerialDisconnect);

    return () => {
      serial.removeListener('disconnect', handleSerialDisconnect);
    };
  }, [handleSerialDisconnect, serial]);

  useEffect(() => {
    if (supportSerialAPI()) setAppStatus('ready_to_compile');
  }, []);

  const handleUpload = useCallback(async () => {
    if (!supportSerialAPI() && !postMessage) {
      toast({ status: `error`, description: 'Carregamento não suportado' });
      return;
    }

    const compile = async () => {
      try {
        setAppStatus('compiling');
        await handleCompilation();
        setAppStatus('compiled');
        setEditorErrors([{} as any]);
      } catch (err: any) {
        setEditorErrors(getEditorErrors(err));
        setAppStatus('compilation_failed');
      }
    };

    compile();
  }, [handleCompilation, postMessage]);

  const projectPromiseHandler = useCallback(
    (params: ICreateProjectParams) =>
      // eslint-disable-next-line no-async-promise-executor
      new Promise<void>(async (resolve, reject) => {
        try {
          const schema = Yup.object().shape({
            name: Yup.string().required('Insira o nome do projeto'),
            private: Yup.boolean(),
          });

          await schema.validate(params, {
            abortEarly: false,
          });

          const element = document.querySelector('#blocklyDiv') as HTMLElement;
          const mimetype = 'image/png';

          if (!folder && !newFolderName) {
            toast({
              status: 'error',
              description: 'Selecione uma pasta para continuar',
            });
            return;
          }

          if (element && params.source_code.mode === 'block') {
            const [canvas, { link, path }] = await Promise.all([
              html2canvas(element, {
                x: 380,
                width: window.innerWidth - 380,
                height: window.innerHeight - parseInt(dimensions.header.height),
                backgroundColor: '#fff',
              }),
              getPresignedUrl(mimetype),
            ]);

            canvas.toBlob(async (blob: any) => blob && (await uploadFile(link, blob)), mimetype, 1.0);

            params.snapshot = path;
          }

          const currentFolder = folder || (await createProjectFolder({ name: newFolderName }));

          if (!folder) {
            setFolder(currentFolder);
            setFolders((f) => [
              {
                id: currentFolder.id,
                name: currentFolder.name,
                projects_count: 0,
              },
              ...f,
            ]);
          }

          params.folder_id = currentFolder.id;

          const isNewProject = !project || project.user_id !== user?.id;

          const updatedProject = isNewProject
            ? await createProject(params)
            : await updateProject({
                ...params,
                id: project.id,
              });

          setProject(updatedProject);
          setProjectName('');
          setProjectNameError('');
          setPrivateProject(false);
          setOpenProjectModal(false);
          resolve();
          if (isNewProject) router.push(`/code/${updatedProject.id}?folder_id=${updatedProject.folder_id}`);
        } catch (err) {
          if (err instanceof Yup.ValidationError) {
            const error = getValidationError(err);

            setProjectNameError(error.name);
          }

          showErrorToClient(err, toast);
          reject(err);
        }
      }),
    [toast, project, folder, newFolderName, user?.id, router],
  );

  const handleProjectSubmit = useCallback(
    (params: ICreateProjectParams) => {
      if (scratchState.workspace.scrollCenter) scratchState.workspace.scrollCenter();

      toast({
        status: 'loading',
        description: `Salvando o projeto`,
        // promiseOptions: {
        //   messages: {
        //     loading: 'Salvando o projeto',
        //     error: 'Erro ao salvar o projeto',
        //     success: 'Projeto salvo',
        //   },
        //   promise: projectPromiseHandler(params),
        // },
      });
    },
    [toast, projectPromiseHandler],
  );

  useEffect(() => {
    if (!appStatus.endsWith('failed')) return;

    const restoreInitialState = async () => {
      await delay(uploadConfig.MESSAGE_VISIBILITY_TIME);
      setAppStatus('ready_to_compile');
    };

    restoreInitialState();
  }, [appStatus]);

  const handleDuplicate = useCallback(() => (user ? setOpenProjectModal(true) : setShowFormModal(true)), [user]);

  const handleSimulation = () => {
    setShowCodeModal(true);
  };

  const handleSave = useCallback(() => {
    if (!user) {
      setShowFormModal(true);
      return;
    }

    if (!project) {
      setOpenProjectModal(true);
      return;
    }

    handleProjectSubmit({
      private: project.private,
      name: project.name,
      source_code: sourceCodeRef.current,
      folder_id: folder?.id || '',
    });
  }, [handleProjectSubmit, project, user, folder]);

  useEffect(() => {
    headerEvents.addListener('upload', handleUpload);
    headerEvents.addListener('save', handleSave);
    headerEvents.addListener('duplicate', handleDuplicate);
    headerEvents.addListener('simulation', handleSimulation);
    headerEvents.addListener('debug', handleSerialMonitor);
    headerEvents.addListener('toText', handleToText);

    headerEvents.emit('permissionchange', appStatus === 'ready_to_compile');
    headerEvents.emit('ownerchange', isDefaultProject || (!!user && project?.user_id === user?.id));

    return () => {
      headerEvents.removeListener('upload', handleUpload);
      headerEvents.removeListener('save', handleSave);
      headerEvents.removeListener('duplicate', handleDuplicate);
      headerEvents.removeListener('simulation', handleSimulation);
      headerEvents.removeListener('debug', handleSerialMonitor);
      headerEvents.removeListener('toText', handleToText);
    };
  }, [
    appStatus,
    handleDuplicate,
    handleSave,
    handleSimulation,
    handleUpload,
    handleSerialMonitor,
    handleToText,
    isDefaultProject,
    project?.user_id,
    user,
  ]);

  useMemo(() => setLoadingConfig((e) => ({ ...e, isLoading: true })), []);

  useEffect(() => {
    const desc = setTimeout(() => setLoadingConfig((e) => ({ ...e, isLoading: false })), 500);
    return () => clearTimeout(desc);
  }, []);

  const handleCodeModalClose = useCallback((updatedUser: IHubUser | null) => {
    if (updatedUser) {
      setUser(updatedUser);
      setShowSimulatorModal(true);
    }

    setShowCodeModal(false);
  }, []);

  const handleSourceCodeChange = useCallback((sourceCode: IProjectSourceCode) => {
    sourceCodeRef.current = sourceCode;

    if (!simulatorCodeHandlerRef.current) return;

    simulatorCodeHandlerRef.current(parseSourceCode(sourceCode, 'js'));
  }, []);

  const handleSerialMonitorClose = useCallback(() => setShowSerialMonitor(false), []);

  const handleFolderChange = useCallback(
    (value: string) => {
      const selectedFolder = folders.find((f) => f.id === value);

      if (selectedFolder) setFolder({ ...selectedFolder, projects: [] });
      else setNewFolderName(value);
    },
    [folders],
  );

  return (
    <Flex direction="column" flex="1">
      <CodeEditor sourceCodeRef={sourceCodeRef} board={board} onSourceCodeChange={handleSourceCodeChange} editorErrors={editorErrors} />
      {/* <StatusModal status={appStatus} /> */}
      {/* <SignInSignUpModal show={showFormModal} onClose={handleSignIn} modalStyle="modal" /> */}
      {/* <GenericModal
        title={isDefaultProject || (project && project?.user_id === user?.id) ? 'Salvar projeto' : 'Duplicar projeto'}
        confirmButtonTitle={isDefaultProject || (project && project?.user_id === user?.id) ? 'Criar' : 'Duplicar'}
        show={openProjectModal}
        onClose={() => setOpenProjectModal(false)}
        onSave={() =>
          handleProjectSubmit({
            private: privateProject,
            name: projectName,
            source_code: sourceCodeRef.current,
            folder_id: folder?.id || '',
          })
        }
      >
        <Project
          name={{ value: projectName, error: projectNameError }}
          privateProject={privateProject}
          setName={setProjectName}
          setPrivate={setPrivateProject}
          folders={folders}
          folder={_folder}
          onChangeFolder={handleFolderChange}
        />
      </GenericModal>
      <Simulator
        showModal={showSimulatorModal}
        sourceCodeRef={sourceCodeRef}
        codeHandlerRef={simulatorCodeHandlerRef}
        iframeUrl={iframeUrl}
        onCloseModal={setShowSimulatorModal}
        onSourceCodeChange={handleSourceCodeChange}
      /> */}
      {/* <SimulationCodeModal show={showCodeModal} onClose={handleCodeModalClose} />
      <SerialMonitor show={showSerialMonitor} onClose={handleSerialMonitorClose} usbFilters={usbFilters} /> */}
      {/* <EditorModeModal show={showEditorModeModal} onClose={handleEditorModalClose} /> */}
    </Flex>
  );
};

export default Code;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    cookieManager.updateToken(req);

    const user = null;
    const project = null;
    const folder = null;
    const folders: any[] = [];

    return {
      props: {
        selectedPage: 'code',
        user,
        project,
        folder,
        folders,
        isDefaultProject: true,
        iframeUrl: process.env.NEXT_PUBLIC_PHYSICAL_SIMULATOR_URL || '',
      },
    };
  } catch {
    return { redirect: { destination: '/code/example', permanent: false } };
  }
};
