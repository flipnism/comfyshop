import React from 'react';
import {entrypoints} from 'uxp';
import {ControllerComponent, ControllerProps, MenuItems, PanelController, RT} from './controllers/PanelController';
import {CommandMap, Panels} from './panels/Panels';
import {CommandController} from './controllers/CommandController';
import './index.css';
interface Commands extends ControllerProps {
  component: ControllerComponent;
}
export const Commands: Readonly<Commands[]> = [];
const commands = Commands.reduce<CommandMap>((acc, {component, ...command}) => {
  acc[command.id] = new CommandController(component, command);
  return acc;
}, {} as CommandMap);
const panels = Panels.reduce((acc, {component, menuItems, ...panel}) => {
  const _menuItems = menuItems.reduce<MenuItems[]>((acc, menuItem) => {
    const oninvoke = (): RT => menuItem.oninvoke(commands);
    acc.push({...menuItem, oninvoke});
    return acc;
  }, []);
  acc[panel.id] = new PanelController(component, {...panel, menuItems: _menuItems});
  //
  return acc;
}, {});
export interface UxpPluginInfo {
  id: string;
  version: string;
  name: string;
  manifest: JSON;
}
entrypoints.setup({
  panels,
});
