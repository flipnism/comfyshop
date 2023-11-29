export async function fetchObjectInfo(object_info: any) {
  const res = await fetch('http://127.0.0.1:8188/object_info/' + object_info);
  const result = await res.json();
  return result;
}
export function random_seed() {
  // Generate a random integer within a suitable range
  const min = 0;
  const max = 2147483647; // Maximum value for Torch seed
  const randomSeed = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomSeed;
}

export function sendWorkflowDataToServer(workflow_data: any, uuid: string) {
  const data_to_send = JSON.stringify(
    {
      prompt: workflow_data,
      client_id: uuid,
    },
    null,
    2
  );

  fetch('http://127.0.0.1:8188/prompt', {
    method: 'POST',
    body: data_to_send,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => {
      if (response.status != 200) {
        console.error('something is wrong', response.status);
      }
    })
    .catch((e) => console.log(e));
}

export function InterruptServer() {
  fetch('http://127.0.0.1:8188/interrupt', {
    method: 'POST',
  })
    .then((response) => {
      if (response.status != 200) {
        console.error('something is wrong', response.status);
      }
    })
    .catch((e) => console.log(e));
}

export const server_type = Object.freeze({
  status: 'status',
  execution_start: 'execution_start',
  execution_cached: 'execution_cached',
  executing: 'executing',
  progress: 'progress',
  executed: 'executed',
});
export async function _arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
export interface progress {
  type: 'progress';
  data: {value: number; max: number};
}
export interface status {
  type: 'status';
  data: {status: {exec_info: {queue_remaining: number}; sid: string}};
}
export interface execution_start {
  type: 'execution_start';
  data: {prompt_id: string};
}
export interface execution_cached {
  type: 'execution_cached';
  data: any;
}
export interface executing {
  type: 'executing';
  data: {node: string; prompt_id: string};
}
export interface progress {
  type: 'progress';
  data: {value: number; max: number};
}

export interface executed {
  type: 'executed';
  data: {node: string; output: {images: output_images[]}; prompt_id: string};
}
export interface output_images {
  filename: string;
  subfolder: string;
  type: string;
}
