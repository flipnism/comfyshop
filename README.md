# **COMFYSHOP**

photoshop plugin to work with ComfyUI Backend. first of all, u need to create a working directory somewhere and then store all files inside `./templates` folder into that folder. Note that, you must have to Symlink ComfyUI folder inside this folder and rename it `ComfyUI`

once u open the Photoshop, it will ask you that folder (onetime only)

there are 2 Panel you can work with

Main Panel are when u can load any worklows that store inside `[workingdirectory]/workflows`

u need to edit the workflow file and add some stuff in you want to show it on the GUI

```
"337": {
  "inputs": {
  "image": "BaseImage_pk7aw.png",
  "choose file to upload": "image"
  },
"show": true,
"title": "BaseImage",
"class_type": "LoadImage"
},
```

i add more value to every card

> "show" => true if you want to show on the plugin GUI

> "title" => for the GUI title

u can install this simple addon inside `extras `folder to make it easier on ComfyUI frontend.

copy `comfyshop-helper` folder into `custome_nodes `folder

u can right click a node on comfyui frontend and choose show on comfyshop. it will add a ✅ emoji on it's title. once its done, u can press  `Copy API to Clipboard` button on menu


# **QUICKPANEL IMAGE GENERATOR**

template file could be found in `./templates/image_generator.json`  replace this file with your own template. you need to change some value to:

```
"[model_name]"
"[seed]"
"[positive_prompt]"
"[negative_prompt]"
"[image_width]"
"[image_height]"
```

i.e

```
"ckpt_name":"[model_name]"
```

change the model in `./templates/config.json`  to

```
"qp_generator_model": "juggernaut_aftermath.safetensors",
```
