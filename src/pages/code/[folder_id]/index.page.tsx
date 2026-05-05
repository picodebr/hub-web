import { GetServerSideProps } from 'next';
import { FaPlus, FaRegShareSquare } from 'react-icons/fa';
import { FiMoreVertical, FiTrash } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { capitalizeString, cookieManager, formatShortName } from '@/_base/utils';
import { Avatar, Button, Flex, Menu, MenuButton, MenuItem, MenuItemOption, MenuList, MenuOptionGroup, Skeleton, Text } from '@chakra-ui/react';
import { useAsyncCallback, useAuth, useCustomRouter, useCustomToast } from '@/_base/hooks';
import { PlusButton } from '@/components/Buttons/Plus';
import { BsMotherboard } from 'react-icons/bs';
import { useEffect, useMemo, useState } from 'react';
import { IProjectFolder } from '@/_base/interfaces/codeFolder/IProjectFolder';
import { getCodeProjectFolder } from '@/_base/services/codeProjectFolder';
import { createCodeProject, removeCodeProject, shareCodeProject } from '@/_base/services/codeProject';
import { ICodeProject } from '@/_base/interfaces/codeProject/IProject';
import { SmallModal } from '@/components/Modal/Small';
import { LuSquareDashedBottomCode } from 'react-icons/lu';
import { IHubUser } from '@/_base/interfaces/user';
import { listRelatedUsers } from '@/_base/services/user';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { AvatarList } from '@/components/AvatarList';
import { BiCode } from 'react-icons/bi';
import { TextInput } from '@/components/Inputs/Text';
import DropdownMenu from 'rsuite/esm/Dropdown/DropdownMenu';
import { ArrowLeft, Code2, Globe, Lock, Plus, Trash2 } from 'lucide-react';
import moment from 'moment';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { InternalCard } from '@/components/InternalCard';

interface IProps {
  folderId: string;
}

const CodeProjects: React.FC<IProps> = ({ folderId }) => {
  const [targetFolder, setTargetFolder] = useState<IProjectFolder | null>(null);
  const [targetProjectToRemove, setTargetProjectToRemove] = useState<ICodeProject | null>(null);
  const [targetProjectToShare, setTargetProjectToShare] = useState<ICodeProject | null>(null);
  const [usersToShare, setUsersToShare] = useState<IHubUser[]>([]);
  const [relatedUsers, setRelatedUsers] = useState<IHubUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState<string | null>(null);

  const toast = useCustomToast();
  const router = useCustomRouter();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [projectFolder, relatedUsersRes] = await Promise.all([getCodeProjectFolder(folderId), listRelatedUsers()]);
        setTargetFolder(projectFolder);
        setRelatedUsers(relatedUsersRes);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar as pastas disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const onCloseModal = () => {
    setTargetProjectToRemove(null);
    setTargetProjectToShare(null);
    setUsersToShare([]);
  };

  const handleRemoveProject = useAsyncCallback(
    async () => {
      if (!targetProjectToRemove) return;
      setIsLoading(true);
      await removeCodeProject(targetProjectToRemove.id);
      setTargetFolder((f) => ({ ...(f || ({} as any)), projects: f?.projects.filter((p) => p.id !== targetProjectToRemove.id) || [] }));
      onCloseModal();
    },
    [targetProjectToRemove],
    true,
    () => setIsLoading(false),
  );

  const handleShareProject = useAsyncCallback(
    async () => {
      if (!targetProjectToShare || !usersToShare) return;
      setIsLoading(true);
      await Promise.all(usersToShare.map((u) => shareCodeProject({ hub_user_id: u.id, code_project_id: targetProjectToShare.id })));
      onCloseModal();
    },
    [targetProjectToRemove],
    true,
    () => setIsLoading(false),
  );

  const handleCreateProject = useAsyncCallback(
    async () => {
      if (!newProjectName) {
        toast({ status: 'error', description: 'O nome do projeto não pode ser vazio' });
        return;
      }
      setIsLoading(true);
      const newProject = await createCodeProject({
        folder_id: folderId,
        name: newProjectName || 'Novo projeto',
      });
      router.push(`/code/${folderId}/${newProject.id}?_p=${newProject.name}&allow-new-code=true`);
      setNewProjectName(null);
      toast({
        status: 'success',
        position: `top`,
        duration: 5000,
        description: 'Redirecionando você para o novo projeto',
        title: `Projeto criado com sucesso!`,
      });
    },
    [],
    true,
    () => setIsLoading(false),
  );

  return (
    <Flex flex="1" direction="column" gap="20px" textAlign="left" whiteSpace="nowrap">
      <InternalPageHeader
        title={targetFolder?.name || `Projetos`}
        description={`${targetFolder?.projects.length || `0`} ${targetFolder?.projects.length === 1 ? 'projeto' : 'projetos'}`}
        buttons={[{ label: `Novo projeto`, leftIcon: <FaPlus />, onClick: () => setNewProjectName(``) }]}
      />

      <Skeleton
        display={{ base: `grid`, sm: 'grid' }}
        minH="calc(100% - 2rem)"
        isLoaded={!isLoading}
        gap="1rem"
        gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(150px, 1fr))', sm: 'repeat(auto-fill, minmax(290px, 1fr))' }}
        gridTemplateRows={{ base: undefined, sm: 'minmax(min-content, max-content)' }}
        gridAutoRows={{ base: '200px', sm: `max-content` }}
        rowGap={{ base: `1rem`, sm: `3rem`, md: `1rem` }}
        borderRadius="md"
        flex="1"
        pt="1rem "
      >
        {targetFolder?.projects?.map((project, index) => (
          <InternalCard
            key={project.id}
            minH="200px"
            index={index}
            onClick={() =>
              Object.keys(project.metadata || {}).length
                ? router.push(`/code/${folderId}/${project.id}?_p=${project.name}&allow-new-code=true`)
                : router.push(`/code/${folderId}/${project.id}?_p=${project.name}`)
            }
            title={project.name}
            actions={[
              { label: `Compartilhar`, onClick: () => setTargetProjectToShare(project), Icon: FaRegShareSquare },
              { label: `Remover`, onClick: () => setTargetProjectToRemove(project), Icon: Trash2, important: true },
            ]}
            content={
              <Flex className="p-3 pb-2" h={{ base: `6rem`, sm: 40 }}>
                <CodeThumbnail lines={[project.metadata?.uploadMode.code || project.source_code?.code || '']} />
              </Flex>
            }
            footer={
              <div className="flex items-end justify-between gap-2 flex-1 h-full">
                <p className="text-[11px] text-muted-foreground/70 truncate">{moment(project.updated_at).fromNow()}</p>
                {(() => {
                  const isPrivate = !!project.private;
                  return (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        isPrivate
                          ? 'bg-foreground/10 text-foreground border-foreground/20'
                          : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'
                      }`}
                      title={isPrivate ? 'Projeto publicado — visível apenas para você' : 'Projeto público — visível para todos'}
                    >
                      {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      {isPrivate ? 'PRIVADO' : 'PÚBLICO'}
                    </span>
                  );
                })()}
              </div>
            }
          />
        ))}
      </Skeleton>

      {/* Remove project modal */}
      <SmallModal
        show={!!targetProjectToRemove}
        topIcon="warning"
        onCancel={onCloseModal}
        onConfirm={handleRemoveProject}
        title="Atenção"
        okText="Confirmar"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <Text fontSize="1rem" fontWeight="500" color="gray600">
            Tem certeza que deseja excluir o projeto <b>{targetProjectToRemove?.name}</b> ?
          </Text>
          <Text fontSize="1rem" fontWeight="500" color="gray600">
            Essa ação é <b>irreversível</b>.
          </Text>
        </Flex>
      </SmallModal>

      {/* Share project modal */}
      <SmallModal
        show={!!targetProjectToShare}
        topIcon="checked"
        onCancel={onCloseModal}
        onConfirm={handleShareProject}
        title=" Quem vai ter acesso ao projeto?"
        okText="Confirmar"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <Menu closeOnSelect={false} placement="right">
            <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />} border="1px" borderColor="gray300" bg="white">
              Selecionar
            </MenuButton>
            <MenuList borderColor="gray300" maxH="15rem" overflow="hidden auto">
              <MenuOptionGroup type="checkbox">
                {relatedUsers.length ? (
                  relatedUsers.map((user) => (
                    <MenuItemOption
                      key={user.id}
                      value={user.id}
                      isChecked={!!targetProjectToShare?.share_links?.find((e) => e.hub_user_id === user.id)}
                      _hover={{ filter: `brightness(0.9)` }}
                      onClick={() =>
                        setUsersToShare((data) => (data.find((u) => u.id === user.id) ? data.filter((u) => u.id !== user.id) : [...data, user]))
                      }
                    >
                      <Flex align="center" gap="0.5rem">
                        <Avatar
                          name={formatShortName(user?.name || ``)}
                          src={user?.avatar || ``}
                          title={user?.name}
                          h="35px"
                          w="35px"
                          border="1px"
                          borderColor="gray200 !important"
                        />
                        <Text>{capitalizeString(user.name)}</Text>
                      </Flex>
                    </MenuItemOption>
                  ))
                ) : (
                  <MenuItem isDisabled>Nenhum membro disponível</MenuItem>
                )}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <AvatarList
            users={relatedUsers.filter(
              (e) => !!targetProjectToShare?.share_links.find((s) => s.hub_user_id === e.id) || usersToShare.find((u) => u.id === e.id),
            )}
            max={10}
            emptyMessage="-"
          />
        </Flex>
      </SmallModal>

      <SmallModal
        show={newProjectName !== null}
        topIcon="checked"
        onCancel={() => setNewProjectName(null)}
        onConfirm={handleCreateProject}
        title="Defina um nome para esse projeto"
        okText="Confirmar"
        size="md"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <TextInput value={newProjectName || ''} onChange={(e) => setNewProjectName(e.target.value)} />
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default CodeProjects;

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const selectedPage = 'code';

  cookieManager.updateToken(req);

  const folderId = query.folder_id || ``;
  const pageTitle = query._p || 'Meus projetos';

  return { props: { selectedPage, pageTitle, folderId, fullscreen: true } };
};

interface CodeThumbnailProps {
  lines: string[];
  variant?: 'card' | 'large';
}

const KEYWORDS = ['void', 'int', 'float', 'char', 'bool', 'if', 'else', 'for', 'while', 'return', 'true', 'false', '#include'];
const FUNCTIONS = [
  'setup',
  'loop',
  'pinMode',
  'digitalWrite',
  'digitalRead',
  'analogRead',
  'analogWrite',
  'Serial',
  'begin',
  'print',
  'println',
  'delay',
  'attach',
  'write',
];

const tokenize = (line: string) => {
  // Comments first
  if (line.trim().startsWith('//')) {
    return [{ text: line, color: 'text-emerald-500/70 dark:text-emerald-400/70' }];
  }
  if (line.trim().startsWith('#')) {
    return [{ text: line, color: 'text-pink-500 dark:text-pink-400' }];
  }

  const tokens: { text: string; color: string }[] = [];
  // Split on word boundaries while keeping delimiters
  const parts = line.split(/(\s+|[(){};,.])/);
  for (const p of parts) {
    if (!p) continue;
    if (KEYWORDS.includes(p)) {
      tokens.push({ text: p, color: 'text-violet-500 dark:text-violet-400 font-semibold' });
    } else if (FUNCTIONS.includes(p)) {
      tokens.push({ text: p, color: 'text-sky-500 dark:text-sky-400' });
    } else if (/^\d+$/.test(p)) {
      tokens.push({ text: p, color: 'text-amber-500 dark:text-amber-400' });
    } else if (/^[A-Z_][A-Z0-9_]+$/.test(p)) {
      tokens.push({ text: p, color: 'text-rose-500 dark:text-rose-400' });
    } else if (/^\".*\"$/.test(p) || /^'.*'$/.test(p)) {
      tokens.push({ text: p, color: 'text-emerald-500 dark:text-emerald-400' });
    } else {
      tokens.push({ text: p, color: 'text-foreground/70' });
    }
  }
  return tokens;
};

const CodeThumbnail = ({ lines, variant = 'card' }: CodeThumbnailProps) => {
  const visibleLines = useMemo(() => lines.slice(0, variant === 'large' ? 10 : 7), [lines, variant]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Editor top bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/40 bg-background/50 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-red-400/80" />
        <span className="w-2 h-2 rounded-full bg-amber-400/80" />
        <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
        <span className="ml-2 text-[9px] font-mono text-muted-foreground/70 truncate">main.ino</span>
      </div>

      {/* Code body */}
      <div className="px-2.5 py-2.5 space-y-0.5">
        {visibleLines.map((line, idx) => {
          const tokens = tokenize(line);
          return (
            <div key={idx} className="flex items-start gap-2 leading-tight">
              <span className="text-[9px] font-mono text-muted-foreground/40 w-3 text-right select-none flex-shrink-0">{idx + 1}</span>
              <div className="text-[10px] font-mono whitespace-pre overflow-hidden truncate flex-1">
                {tokens.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  tokens.map((t, i) => (
                    <span key={i} className={t.color}>
                      {t.text}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
    </div>
  );
};
