import {createRoot} from 'react-dom/client';

const _id = Symbol('_id');
const _root = Symbol('_root');
const _attachment = Symbol('_attachment');
const _Component = Symbol('_Component');
const _menuItems = Symbol('_menuItems');
export type ControllerComponent = (...args: any) => JSX.Element;
export interface ControllerProps {
  id: string;
  title?: string;
  size?: {width: number; height: number};
  menuItems?: MenuItems[];
}
export interface MenuItems {
  id: string;
  label: string;
  enabled: boolean;
  checked: boolean;
  oninvoke(): RT;
}
export type RT = void | Promise<void>;
export class PanelController {
  constructor(Component: React.FC | ControllerComponent, {id, menuItems}: ControllerProps) {
    this[_id] = null;
    this[_root] = null;
    this[_attachment] = null;
    this[_Component] = null;
    this[_menuItems] = [];

    this[_Component] = Component;
    this[_id] = id;
    this[_menuItems] = menuItems || [];
    // @ts-expect-error
    this.menuItems = this[_menuItems].map((menuItem) => ({
      id: menuItem.id,
      label: menuItem.label,
      enabled: menuItem.enabled || true,
      checked: menuItem.checked || false,
    }));

    ['create', 'show', 'hide', 'destroy', 'invokeMenu'].forEach((fn) => (this[fn] = this[fn].bind(this)));
  }

  create() {
    this[_root] = document.createElement('div');
    this[_root].style.height = '100vh';
    this[_root].style.minHeight = '100%';
    // this[_root].style.overflowY = 'scroll';
    this[_root].style.padding = '8px';

    const root = createRoot(this[_root]);
    root.render(this[_Component]({panel: this}));

    return this[_root];
  }

  show(event) {
    if (!this[_root]) this.create();
    this[_attachment] = event;
    this[_attachment].appendChild(this[_root]);
  }

  hide() {
    if (this[_attachment] && this[_root]) {
      this[_attachment].removeChild(this[_root]);
      this[_attachment] = null;
    }
  }

  destroy() {}

  invokeMenu(id) {
    const menuItem = this[_menuItems].find((c) => c.id === id);
    if (menuItem) {
      const handler = menuItem.oninvoke;
      if (handler) {
        handler();
      }
    }
  }
}
