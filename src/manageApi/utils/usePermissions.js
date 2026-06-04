import { useSelector } from 'react-redux';

const usePermission = (moduleName, permissionType) => {
  const { permissions } = useSelector((state) => state.auth);

  const hasPermission = permissions?.some(
    (perm) => perm.moduleId.name === moduleName && perm[permissionType] === 1
  );

  return hasPermission;
};

export default usePermission;