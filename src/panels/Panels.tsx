import React from 'react';
import {RT, ControllerProps, MenuItems, ControllerComponent} from '../controllers/PanelController';
import {CommandController} from '../controllers/CommandController';
import {MainPanel} from './MainPanel';
import {MainPanelv2} from './MainPanelv2';
import {QuickPanel} from './QuickPanel';
export const COMMAND_IDS = Object.freeze({
  SHOW_ABOUT: 'showAbout',
});
type CommandId = (typeof COMMAND_IDS)[keyof typeof COMMAND_IDS];
export type CommandMap = Record<CommandId, CommandController>;
type InvokeFn = (controllers: CommandMap) => RT;

export type Panels = Omit<ControllerProps, 'menuItems'> & {
  menuItems?: (Omit<MenuItems, 'oninvoke'> & {oninvoke: InvokeFn})[];
} & {
  component: ControllerComponent;
};

export const Panels: Readonly<Panels[]> = [
  {
    id: 'mainpanel',
    component: () => <MainPanelv2 />,
    menuItems: [{id: 'reloadme', label: 'Reload Plugin', enabled: true, checked: false, oninvoke: () => location.reload()}],
  },
  {
    id: 'quickpanel',
    component: () => <QuickPanel />,
    menuItems: [{id: 'reloadme2', label: 'Reload QuickPanel', enabled: true, checked: false, oninvoke: () => location.reload()}],
  },
];
