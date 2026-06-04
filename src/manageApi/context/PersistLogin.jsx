import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { rehydrateAuthState } from '../store/authSlice';

const PersistLogin = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Rehydrate auth state when component mounts
    dispatch(rehydrateAuthState());
  }, [dispatch]);

  return children;
};

export default PersistLogin;