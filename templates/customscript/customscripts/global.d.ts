export {};
declare global {
  function logme(msg: string): void;
  function showDialog(title: string, content: string): Promise<boolean>;
  export namespace aio_server {
    const lastJsonMessage: object;
    function sendJsonMessage(message: any): void;
  }
  const bounds: { top: number; left: number; right: number; bottom };
}
