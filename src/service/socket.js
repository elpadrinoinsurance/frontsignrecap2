import io from 'socket.io-client';
const link = process.env.REACT_APP_BACK_URL || "placeholder"

export const socket = io(link)
