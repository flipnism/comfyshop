import { app } from "../../../scripts/app.js";



async function tamperPrompt() {
    for (const node of graph.computeExecutionOrder(false)) {
        if (node.isVirtualNode) {
            // Don't serialize frontend only nodes but let them make changes
            if (node.applyToGraph) {
                node.applyToGraph();
            }
            continue;
        }
    }

    const workflow = graph.serialize();
    const output = {};
    // Process nodes in order of execution
    for (const node of graph.computeExecutionOrder(false)) {
        const n = workflow.nodes.find((n) => n.id === node.id);

        if (node.isVirtualNode) {
            continue;
        }

        if (node.mode === 2 || node.mode === 4) {
            // Don't serialize muted nodes
            continue;
        }

        const inputs = {};
        const widgets = node.widgets;

        // Store all widget values
        if (widgets) {
            for (const i in widgets) {
                const widget = widgets[i];
                if (!widget.options || widget.options.serialize !== false) {
                    inputs[widget.name] = widget.serializeValue ? await widget.serializeValue(n, i) : widget.value;
                }
            }
        }

        // Store all node links
        for (let i in node.inputs) {
            let parent = node.getInputNode(i);
            if (parent) {
                let link = node.getInputLink(i);
                while (parent.mode === 4 || parent.isVirtualNode) {
                    let found = false;
                    if (parent.isVirtualNode) {
                        link = parent.getInputLink(link.origin_slot);
                        if (link) {
                            parent = parent.getInputNode(link.target_slot);
                            if (parent) {
                                found = true;
                            }
                        }
                    } else if (link && parent.mode === 4) {
                        let all_inputs = [link.origin_slot];
                        if (parent.inputs) {
                            all_inputs = all_inputs.concat(Object.keys(parent.inputs))
                            for (let parent_input in all_inputs) {
                                parent_input = all_inputs[parent_input];
                                if (parent.inputs[parent_input]?.type === node.inputs[i].type) {
                                    link = parent.getInputLink(parent_input);
                                    if (link) {
                                        parent = parent.getInputNode(parent_input);
                                    }
                                    found = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (!found) {
                        break;
                    }
                }

                if (link) {
                    inputs[node.inputs[i].name] = [String(link.origin_id), parseInt(link.origin_slot)];
                }
            }
        }

        output[String(node.id)] = {
            inputs,
            show: node.title.includes("✅") ? true : false,
            title: node.title.replace("✅", ""),
            class_type: node.comfyClass,
        };
    }

    // Remove inputs connected to removed nodes

    for (const o in output) {
        for (const i in output[o].inputs) {
            if (Array.isArray(output[o].inputs[i])
                && output[o].inputs[i].length === 2
                && !output[output[o].inputs[i][0]]) {
                delete output[o].inputs[i];
            }
        }
    }

    return { workflow, output };
}

const ext = {
    name: "hello.dcsms.comfyshop-helper",
    init(app) {
        LGraphCanvas.prototype.julSetTitleNode = function (node) {
            node.title = node.title.includes("✅") ? node.title.replace("✅", "") : "✅" + node.title
        };
        const getNodeMenuOptions = LGraphCanvas.prototype.getNodeMenuOptions;
        LGraphCanvas.prototype.getNodeMenuOptions = function (node) {
            const options = getNodeMenuOptions.apply(this, arguments);
            node.setDirtyCanvas(true, true);

            options.splice(options.length - 1, 0, {
                content: "Show on ComfyShop",
                callback: () => { LGraphCanvas.prototype.julSetTitleNode(node); }
            },
                null
            )

            return options;
        };

    },
    setup(app) {

        const menu = document.querySelector(".comfy-menu");
        const managerButton = document.createElement("button");
        managerButton.textContent = "Copy API to Clipboard";
        managerButton.onclick = () => {
            tamperPrompt().then(p => {
                const json = JSON.stringify(p.output, null, 2);
                navigator.clipboard.writeText(json);
            })
        }
        menu.append(managerButton);
    }

};
app.registerExtension(ext);