import React, {useEffect, useState} from 'react';
import DropDrownPicker from './DropDownPicker';

type Props = {
  workflowFiles: any[];
  onSelectionChange: (e: any) => void;
};
export default function WorkflowPicker(props: Props) {
  const [items, setItems] = useState([]);
  function handleOnChange(e) {
    const result = props?.workflowFiles.filter((ex) => ex.name.includes(e.target.value));
    props?.onSelectionChange(result[0]);
  }
  useEffect(() => {
    if (props?.workflowFiles) {
      setItems(props?.workflowFiles.map((e) => e.name.replace('.json', '')));
    }
  }, [props?.workflowFiles]);

  return <DropDrownPicker showSelector={true} selectedIndex={-1} overrideClass="grow" items={items} onChange={handleOnChange} />;
}
