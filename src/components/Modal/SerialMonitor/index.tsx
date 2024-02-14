/* eslint-disable guard-for-in */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { FaTrashAlt } from 'react-icons/fa';
import { TbPlugConnected } from 'react-icons/tb';

import { format } from 'date-fns';
import { DEFAULT_BAUD_RATE, baudRates } from '../../../_base/config/baud';
import { useScrollDirection } from '../../../_base/hooks/ScrollDirection';
import { useScrollThreshold } from '../../../_base/hooks/ScrollThreshold';
import { ILog, ILogCountByType, LogType } from '../../../_base/interfaces/Log/ILog';
import { ISerialMonitorModalProps } from './interfaces';
import { KeyValueManager, SerialConnection, SerialConnectionStatus } from '../../../_base/utils';
import { filterLogAndCount } from './util/filterLogAndCount';
import { getPageSlice } from './util/getPageSlice';
import { makeLog } from './util/makeLog';
import {
  ActionButton,
  BaudItem,
  BaudOptions,
  Container,
  HeaderBottomContent,
  HeaderTopContent,
  HeaderWrapper,
  LogDate,
  LogItem,
  LogList,
  LogText,
  Wrapper,
} from './styles';

const LOG_PAGE_SIZE = 40; // 40 logs per page
const WINDOW_PAGES_SIZE = 3; // 3 * LOG_PAGE_SIZE
const RENDER_REFRESH_INTERVAL = 200; // 5x per second
const MAX_CHARACTERS_BY_FILTER = 100000;

const cleanLogCount = {
  log: 0,
  error: 0,
  warn: 0,
  info: 0,
  command: 0,
  send: 0,
} as ILogCountByType;

const initialState = {
  search: '',
  selectedType: undefined as LogType | undefined,
  logs: [] as ILog[],
  logChunk: null as ILog | null,
  page: WINDOW_PAGES_SIZE,
  baud: DEFAULT_BAUD_RATE,
  readyToConnect: false,
  isConnected: false,
  autoScroll: true,
  showScrollTopButton: false,
  showScrollDownButton: false,
  logTypesCount: { ...cleanLogCount },
  filteredIndex: 0,
  filteredLogs: [] as ILog[],
  filteredLogTypesCount: { ...cleanLogCount },
};

export const SerialMonitor: React.FC<ISerialMonitorModalProps> = ({ show, onClose, usbFilters }) => {
  const kvm = useMemo(() => new KeyValueManager(initialState), []);
  const serial = useMemo(() => new SerialConnection(), []);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const detectUserScroll = useRef(false);

  const [openBaudOptions, setOpenBaudOptions] = useState(false);
  const [renderId, setRenderId] = useState(0);

  useEffect(() => {
    const descriptor = setInterval(() => {
      setRenderId((id) => id + 1);
    }, RENDER_REFRESH_INTERVAL);

    return () => clearInterval(descriptor);
  }, []);

  const handleClearLogs = useCallback(() => {
    kvm.page = WINDOW_PAGES_SIZE;
    kvm.autoScroll = true;
    kvm.logs = [];
    kvm.showScrollTopButton = false;
    kvm.showScrollDownButton = false;
    kvm.logTypesCount = { ...cleanLogCount };

    setRenderId((id) => id + 1);
  }, [kvm]);

  useEffect(() => {
    const ref = wrapperRef.current;
    if (!ref || !show) return () => ({});

    const handler = (e: Event) => {
      if (e.target !== ref) return;

      onClose();
    };

    ref.addEventListener('mousedown', handler);
    ref.addEventListener('touchstart', handler);

    return () => {
      ref.removeEventListener('mousedown', handler);
      ref.removeEventListener('touchstart', handler);
    };
  }, [onClose, show]);

  useEffect(() => {
    if (show) {
      kvm.readyToConnect = true;
    } else serial.disconnect();
  }, [show]);

  const handleBaudRateChange = useCallback((value: number) => (kvm.baud = value), [kvm]);

  const handleSerialChunk = useCallback((content: string | null) => (kvm.logChunk = content ? makeLog('log', content) : null), [kvm]);

  const pushNewLogLine = useCallback(
    (log: ILog) => {
      kvm.logChunk = null;
      kvm.logs.push(log);
      kvm.logTypesCount[log.type]++;
    },
    [kvm],
  );

  const handleSerialLine = useCallback((line: string) => pushNewLogLine(makeLog('log', line)), [pushNewLogLine]);

  const handleSerialConnect = useCallback(
    (reused: boolean) => {
      if (reused) pushNewLogLine(makeLog('info', `Dispositivo conectado`));

      kvm.isConnected = true;
    },
    [kvm, pushNewLogLine],
  );

  const handleSerialDisconnect = useCallback(
    async (status: SerialConnectionStatus) => {
      if (kvm.logChunk) pushNewLogLine(kvm.logChunk);

      kvm.logChunk = null;
      kvm.isConnected = false;
      kvm.autoScroll = true;

      if (status === 'disconnected') {
        pushNewLogLine(makeLog('info', `Dispositivo desconectado`));
        kvm.readyToConnect = false;
      }
    },
    [kvm, pushNewLogLine],
  );

  useEffect(() => {
    const handleIsConnectedChange = () => {
      kvm.autoScroll = kvm.isConnected;
    };

    kvm.addChangeListener('isConnected', handleIsConnectedChange);

    return () => {
      kvm.removeChangeListener('isConnected', handleIsConnectedChange);
    };
  }, [kvm]);

  useEffect(() => {
    const handleFilterChange = () => {
      kvm.page = WINDOW_PAGES_SIZE;
      kvm.showScrollDownButton = false;
      kvm.showScrollTopButton = false;
    };

    kvm.addChangeListener('search', handleFilterChange);
    kvm.addChangeListener('selectedType', handleFilterChange);

    return () => {
      kvm.removeChangeListener('search', handleFilterChange);
      kvm.removeChangeListener('selectedType', handleFilterChange);
    };
  }, [kvm]);

  useEffect(() => {
    serial.addListener('chunk', handleSerialChunk);
    serial.addListener('line', handleSerialLine);
    serial.addListener('connect', handleSerialConnect);
    serial.addListener('disconnect', handleSerialDisconnect);

    return () => {
      serial.removeListener('chunk', handleSerialChunk);
      serial.removeListener('line', handleSerialLine);
      serial.removeListener('connect', handleSerialConnect);
      serial.removeListener('disconnect', handleSerialDisconnect);
    };
  }, [handleSerialChunk, handleSerialLine, handleSerialConnect, handleSerialDisconnect, serial]);

  useEffect(() => {
    const handleConnectionChange = async () => {
      try {
        if (!kvm.readyToConnect) return;

        await serial.connect({ baudRate: kvm.baud }, usbFilters);
      } catch {
        kvm.readyToConnect = false;
      }
    };

    kvm.addChangeListener('readyToConnect', handleConnectionChange);
    kvm.addChangeListener('baud', handleConnectionChange);

    return () => {
      kvm.removeChangeListener('readyToConnect', handleConnectionChange);
      kvm.removeChangeListener('baud', handleConnectionChange);
    };
  }, [kvm, serial, pushNewLogLine, usbFilters]);

  useEffect(() => {
    const handleReadyToConnect = async () => {
      if (!kvm.readyToConnect) await serial.disconnect();
    };

    kvm.addChangeListener('readyToConnect', handleReadyToConnect);

    return () => {
      kvm.removeChangeListener('readyToConnect', handleReadyToConnect);
    };
  }, [kvm, serial]);

  useMemo(() => {
    kvm.filteredIndex = 0;
    kvm.filteredLogs = [];
    kvm.filteredLogTypesCount = { ...cleanLogCount };
  }, [kvm.search, kvm.selectedType, kvm]);

  useMemo(() => {
    if (!kvm.search && !kvm.selectedType) return;

    const { filtered, count, endIndex } = filterLogAndCount({
      logs: kvm.logs,
      search: kvm.search,
      type: kvm.selectedType,
      startIndex: kvm.filteredIndex,
      maxCharCount: MAX_CHARACTERS_BY_FILTER,
    });

    kvm.filteredIndex = endIndex;
    kvm.filteredLogs.push(...filtered);

    for (const k in count) {
      const key = k as keyof ILogCountByType;
      kvm.filteredLogTypesCount[key] += count[key];
    }
  }, [renderId, kvm]);

  const isFiltering = !!(kvm.search || kvm.selectedType);

  const filteredLogs = isFiltering ? kvm.filteredLogs : kvm.logs;

  const pages = Math.max(Math.ceil(filteredLogs.length / LOG_PAGE_SIZE), WINDOW_PAGES_SIZE);

  const lastPage = Math.max(pages, WINDOW_PAGES_SIZE);

  if (kvm.autoScroll) kvm.page = lastPage;

  const logsSlice = getPageSlice(filteredLogs, {
    page: kvm.page,
    pages: WINDOW_PAGES_SIZE,
    pageSize: LOG_PAGE_SIZE,
  });

  useEffect(() => {
    const handleAutoScrollChange = () => {
      if (kvm.autoScroll) kvm.page = lastPage;
    };

    kvm.addChangeListener('autoScroll', handleAutoScrollChange);

    return () => {
      kvm.removeChangeListener('autoScroll', handleAutoScrollChange);
    };
  }, [kvm, lastPage]);

  useScrollThreshold(
    () => {
      const p = kvm.page;
      kvm.page = p > WINDOW_PAGES_SIZE ? p - 1 : p;
    },
    [],
    scrollRef,
    { offset: { top: { min: 1000 } } },
  );

  useScrollThreshold(
    () => {
      const p = kvm.page;
      kvm.page = p > WINDOW_PAGES_SIZE ? p - 1 : p;
    },
    [],
    scrollRef,
    { offset: { top: { min: 200 } } },
  );

  useScrollThreshold(
    () => {
      const p = kvm.page;
      kvm.page = p < pages ? p + 1 : p;
    },
    [pages],
    scrollRef,
    { offset: { bottom: { min: 1000 } } },
  );

  useScrollThreshold(
    () => {
      const p = kvm.page;
      kvm.page = p < pages ? p + 1 : p;
    },
    [pages],
    scrollRef,
    { offset: { bottom: { min: 200 } } },
  );

  useScrollThreshold(
    () => {
      const { page } = kvm;

      if (page === lastPage) {
        kvm.autoScroll = true;
        kvm.showScrollDownButton = false;
      }
    },
    [lastPage],
    scrollRef,
    { offset: { bottom: { min: 100 } } },
  );

  useScrollThreshold(
    () => {
      if (kvm.autoScroll && detectUserScroll.current) kvm.autoScroll = false;
    },
    [],
    scrollRef,
    { offset: { bottom: { max: 1 } } },
  );

  useScrollThreshold(
    () => {
      if (kvm.page === WINDOW_PAGES_SIZE) kvm.showScrollTopButton = false;
    },
    [],
    scrollRef,
    { offset: { top: { min: 200 } } },
  );

  useScrollDirection((direction) => (kvm.showScrollTopButton = direction.y < 0), [], scrollRef);

  useScrollDirection((direction) => (kvm.showScrollDownButton = direction.y > 0 && !kvm.autoScroll), [], scrollRef);

  const handleReadyToConnect = useCallback((value: boolean) => (kvm.readyToConnect = value), [kvm]);

  useEffect(() => {
    detectUserScroll.current = true;
    if (kvm.autoScroll) scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [kvm, renderId]);

  detectUserScroll.current = false;

  return (
    <Wrapper ref={wrapperRef} opened={show}>
      <Container>
        <HeaderWrapper>
          <HeaderTopContent>
            Serial Monitor
            <ActionButton onClick={() => setOpenBaudOptions(!openBaudOptions)} data-type="select" opened={openBaudOptions}>
              {kvm.baud} baud
              <AiFillCaretDown />
              <BaudOptions opened={openBaudOptions}>
                {baudRates.map((baud) => (
                  <BaudItem key={baud} selected={kvm.baud === baud} onClick={() => handleBaudRateChange(baud)}>
                    {baud}
                  </BaudItem>
                ))}
              </BaudOptions>
            </ActionButton>
          </HeaderTopContent>
          <HeaderBottomContent>
            <ActionButton onClick={handleClearLogs} data-type="remove">
              Remover logs
              <FaTrashAlt />
            </ActionButton>
            <ActionButton onClick={() => handleReadyToConnect(!kvm.isConnected)} data-type="disconnect">
              {kvm.isConnected ? 'Desconectar' : 'Conectar'}
              <TbPlugConnected />
            </ActionButton>
          </HeaderBottomContent>
        </HeaderWrapper>
        <LogList ref={scrollRef}>
          {logsSlice.map((log) => (
            <LogItem key={log.id}>
              {log.content?.replace(/[^A-Za-z0-9._-]/gi, '') && (
                <LogText>
                  {log.content}
                  <LogDate>{format(log.timestamp, 'hh:mm:ss')}</LogDate>
                </LogText>
              )}
            </LogItem>
          ))}
        </LogList>
      </Container>
    </Wrapper>
  );
};
