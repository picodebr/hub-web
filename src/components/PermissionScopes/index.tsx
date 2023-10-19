import { ACCESS_CONTROL_ACTIONS, AccessControlActionType, IPermissionsPerModule } from '@/_base/interfaces/permissions';
import { removeDuplicateItems } from '@/_base/utils/removeDuplicateItems';
import { Checkbox, Flex, Text } from '@chakra-ui/react';

const permissionsLabelMapper: Record<string, Record<AccessControlActionType, string> & { label: string }> = {
  campaign: { label: 'Campaigns', write: 'Create and manage campaigns', read: 'List campaigns and view metrics', delete: 'Remove campaigns' },
  ad: { label: 'Creatives', write: 'Create ads and make creatives', read: 'List ads and view creatives', delete: 'Remove ads and creatives' },
  agency: { label: 'Agencies', write: 'Create and manage agencies', read: 'List agencies', delete: 'Remove agencies' },
  admin: { label: 'Users', write: 'Create and manager admin users', read: 'List admin users', delete: 'Remove admin users' },
  publisher: { label: 'Publishers', write: 'Create and manager publishers', read: 'List publishers', delete: 'Remove publishers' },
  advertiser: { label: 'Advertisers', write: 'Create and manage advertisers', read: 'List advertisers', delete: 'Remove advertisers' },
  permission_group: {
    label: 'Permission Groups',
    write: 'Create and manage permission groups',
    read: 'List permission groups and view details',
    delete: 'Remove permission groups',
  },
};

const actionsLabelMapper: Record<AccessControlActionType, string> = {
  write: 'Create',
  read: 'Read',
  delete: 'Remove',
};

interface IProps {
  onChange: (data: IPermissionsPerModule) => void;
  permissions: IPermissionsPerModule;
  disabled?: boolean;
}

export const PermissionScopes: React.FC<IProps> = ({ permissions, onChange, disabled }) => {
  const handleChangeScope = (scope: string, actions: AccessControlActionType[]) => {
    const newPermissions: Record<string, string[]> = {};
    newPermissions[scope] = actions;
    onChange({ ...permissions, ...newPermissions });
  };

  const handleChangeAction = (scope: string, action: AccessControlActionType, checked: boolean) => {
    const currentActions: AccessControlActionType[] = (permissions as any)[scope];
    let newActions: AccessControlActionType[] = [];

    switch (action) {
      case 'read':
        if (checked) newActions = removeDuplicateItems([...currentActions, action]) as AccessControlActionType[];
        else {
          newActions =
            currentActions.includes('write') || currentActions.includes('delete')
              ? currentActions
              : currentActions.filter((s: AccessControlActionType) => s !== action);
        }
        break;

      default: //write and delete actions have same logic
        newActions = checked
          ? (removeDuplicateItems([...currentActions, action, 'read']) as AccessControlActionType[])
          : currentActions.filter((s: AccessControlActionType) => s !== action);
        break;
    }

    handleChangeScope(scope, newActions);
  };

  return (
    <Flex direction="column" gap="1rem" pointerEvents={disabled ? 'none' : 'auto'} opacity={disabled ? '0.6' : '1'}>
      {Object.keys(permissions).map((scope) => (
        <Flex key={scope} border="1px" color="gray.600" borderColor="gray.300" borderRadius="md" padding="0.5rem" direction="column" gap="0.5rem">
          <Checkbox
            size="md"
            fontWeight="600"
            isChecked={(permissions as any)[scope].length === ACCESS_CONTROL_ACTIONS.length}
            onChange={(e) => handleChangeScope(scope, e.target.checked ? ACCESS_CONTROL_ACTIONS : ([] as any))}
          >
            {permissionsLabelMapper[scope].label}
          </Checkbox>
          <Flex w="100%" gap="0.25rem" direction="column" paddingLeft="0.75rem">
            {ACCESS_CONTROL_ACTIONS.map((action, idx, arr) => (
              <Flex key={action} borderBottom={idx + 1 === arr.length ? '0' : '1px solid'} borderColor="gray.200" paddingBottom="0.25rem">
                <Checkbox
                  flex="2"
                  size="md"
                  isChecked={(permissions as any)[scope].includes(action)}
                  onChange={(e) => handleChangeAction(scope, action, e.target.checked)}
                >
                  {actionsLabelMapper[action]}
                </Checkbox>
                <Text flex="3"> {permissionsLabelMapper[scope][action]}</Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};
