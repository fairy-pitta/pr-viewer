// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// TextDecoder/TextEncoderのポリフィル
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// Next.jsのRequestとResponseのポリフィル
function MockRequest(url) {
  this.url = url;
  this.nextUrl = {
    get searchParams() {
      return new URL(url).searchParams;
    }
  };
}

// @ts-ignore
global.Request = MockRequest;
// @ts-ignore
global.Response = {
  json: function(data, init) {
    return {
      json: async function() { return data; },
      status: (init && init.status) || 200,
    };
  }
};

// NextResponseのモック
// @ts-ignore
global.NextResponse = {
  json: function(data, init) {
    return {
      json: async function() { return data; },
      status: (init && init.status) || 200,
    };
  }
};
