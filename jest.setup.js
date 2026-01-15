// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// TextDecoder/TextEncoderのポリフィル
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
