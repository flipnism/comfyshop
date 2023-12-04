export type listItems = {
  id: number;
  sub_id: number;
  name: string;
  path?: string;
  item_index: number;
};
export enum STATE {
  enable,
  disable,
  interrupt,
}
export namespace NODETYPE {
  //FLOAT,INT,STRING,BOOLEAN
  export type BOOLEAN = {
    default?: boolean;
    label_off?: string;
    label_on?: string;
  };
  export type FLOAT = {
    default?: number;
    min?: number;
    max?: number;
    step?: number;
  };
  export type STRING = {
    default?: string;
    multiline?: boolean;
  };
  export type INT = {
    default?: number;
    min?: number;
    max?: number;
    step?: number;
  };
}
export interface BOUNDS {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export type InlineDialogContent = {
  isloading?: boolean;
  show: boolean;
  title: string;
  message: string;
  onOk?: (e: string) => void;
  onCancel?: (e: string) => void;
};

export type GLOBALCONFIG = {
  imageloader_node: string[];
};
export type CUSTOMSCRIPT = {
  name: string;
  desc?: string;
  icon_path: string;
  executable?: boolean;
  script?: string;
  func: any;
};
