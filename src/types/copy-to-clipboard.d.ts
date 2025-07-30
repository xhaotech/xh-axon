declare module 'copy-to-clipboard' {
  function copy(text: string, options?: { debug?: boolean; message?: string }): boolean;
  export = copy;
}
