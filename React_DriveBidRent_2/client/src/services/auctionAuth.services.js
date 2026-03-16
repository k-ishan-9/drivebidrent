// client/src/services/auctionAuth.services.js
import axiosInstance from '../utils/axiosInstance.util';
import { useNavigate } from 'react-router-dom';

export const auctionAuthServices = {
  signup: async (data) => {
    const res = await axiosInstance.post('/auth/auctionmanager/signup', data);
    return res.data;
  },

  login: async (credentials) => {
    const res = await axiosInstance.post('/auth/auctionmanager/login', credentials);
    return res.data;
  },

  logout: async () => {
    const res = await axiosInstance.get('/auth/auctionmanager/logout');
    return res.data;
  }
};

export const useAuctionManagerLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await auctionAuthServices.logout();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Auction Manager logout failed', err);
      navigate('/', { replace: true });
    }
  };

  return logout;
};
