import axios from 'axios';
import { Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL; // 'http://localhost:8000'

export const sendMessage = async (message: Message): Promise<string> => {
    try {
        const response = await axios.post(`${API_URL}/chat`, message);
        return response.data.response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
