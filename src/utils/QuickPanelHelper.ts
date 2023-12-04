import {action, app, core} from 'photoshop';
import {sendWorkflowDataToServer} from './ServerUtils';
import {generateRandomName} from './BPUtils';
import {STYLE} from '../customcomponents/DropdownStyleChooser';

function generateSeed() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

const inpaintingProcessor = (text_prompt, imagename) => {
  return {
    '118': {
      'inputs': {
        'ckpt_name': 'epicrealism_pureEvolutionV5-inpainting.safetensors',
      },
      'show': false,
      'title': 'Load Checkpoint',
      'class_type': 'CheckpointLoaderSimple',
    },
    '119': {
      'inputs': {
        'add_noise': true,
        'noise_seed': generateSeed(),
        'cfg': 1.2,
        'model': ['179', 0],
        'positive': ['121', 0],
        'negative': ['122', 0],
        'sampler': ['123', 0],
        'sigmas': ['177', 0],
        'latent_image': ['187', 0],
      },
      'show': false,
      'title': 'SamplerCustom',
      'class_type': 'SamplerCustom',
    },
    '121': {
      'inputs': {
        'text': text_prompt,
        'clip': ['118', 1],
      },
      'show': false,
      'title': 'CLIP Text Encode (Prompt)',
      'class_type': 'CLIPTextEncode',
    },
    '122': {
      'inputs': {
        'text': 'text, watermark, embedding:BadDream, embedding:UnrealisticDream',
        'clip': ['118', 1],
      },
      'show': false,
      'title': 'CLIP Text Encode (Prompt)',
      'class_type': 'CLIPTextEncode',
    },
    '123': {
      'inputs': {
        'sampler_name': 'lcm',
      },
      'show': false,
      'title': 'KSamplerSelect',
      'class_type': 'KSamplerSelect',
    },
    '125': {
      'inputs': {
        'samples': ['119', 0],
        'vae': ['188', 0],
      },
      'show': false,
      'title': 'VAE Decode',
      'class_type': 'VAEDecode',
    },
    '177': {
      'inputs': {
        'scheduler': 'sgm_uniform',
        'steps': 4,
        'model': ['179', 0],
      },
      'show': false,
      'title': 'BasicScheduler',
      'class_type': 'BasicScheduler',
    },
    '179': {
      'inputs': {
        'lora_name': 'lcm_sd15_pytorch_lora_weights.safetensors',
        'strength_model': 1,
        'model': ['118', 0],
      },
      'show': false,
      'title': 'LoraLoaderModelOnly',
      'class_type': 'LoraLoaderModelOnly',
    },
    '180': {
      'inputs': {
        'filename_prefix': 'OutPainting',
        'images': ['125', 0],
      },
      'show': false,
      'title': 'Save Image',
      'class_type': 'SaveImage',
    },
    '181': {
      'inputs': {
        'image': imagename,
        'upload': 'image',
      },
      'show': false,
      'title': 'Load Image',
      'class_type': 'LoadImage',
    },
    '187': {
      'inputs': {
        'grow_mask_by': 6,
        'pixels': ['181', 0],
        'vae': ['188', 0],
        'mask': ['181', 1],
      },
      'show': false,
      'title': 'VAE Encode (for Inpainting)',
      'class_type': 'VAEEncodeForInpaint',
    },
    '188': {
      'inputs': {
        'vae_name': 'vae-ft-mse-840000-ema-pruned.safetensors',
      },
      'show': false,
      'title': 'Load VAE',
      'class_type': 'VAELoader',
    },
  };
};

async function saveLayerAsInput(IOFolder) {
  return await core.executeAsModal(
    async (_executionContext, descriptor: object) => {
      let hostControl = _executionContext.hostControl;
      let documentID = app.activeDocument.id;
      let suspensionID = await hostControl.suspendHistory({
        documentID: documentID,
        name: 'inpaintCUrrentSelectedLayer',
      });
      let selectedLayer = app.activeDocument.activeLayers[0];
      let rand_name = generateRandomName(null, true);
      selectedLayer.name = rand_name;
      await action.batchPlay(
        [
          {
            _obj: 'exportSelectionAsFileTypePressed',
            _target: {_ref: 'layer', _enum: 'ordinal', _value: 'targetEnum'},
            fileType: 'png',
            quality: 32,
            metadata: 0,
            destFolder: IOFolder?.input?.nativePath, //destFolder.nativePath,
            sRGB: true,
            openWindow: false,
            _options: {dialogOptions: 'dontDisplay'},
          },
        ],
        {}
      );

      await hostControl.resumeHistory(suspensionID, true);
      return rand_name + '.png';
    },
    {'commandName': 'preparing inpainting'}
  );
}

export async function inpaintCUrrentSelectedLayer(IOFolder, text_prompt, uuid) {
  return await core.executeAsModal(
    async (_executionContext, descriptor: object) => {
      let hostControl = _executionContext.hostControl;
      let documentID = app.activeDocument.id;
      let suspensionID = await hostControl.suspendHistory({
        documentID: documentID,
        name: 'inpaintCUrrentSelectedLayer',
      });
      let selectedLayer = app.activeDocument.activeLayers[0];
      let rand_name = generateRandomName(null, true);
      selectedLayer.name = rand_name;
      await action.batchPlay(
        [
          {
            _obj: 'exportSelectionAsFileTypePressed',
            _target: {_ref: 'layer', _enum: 'ordinal', _value: 'targetEnum'},
            fileType: 'png',
            quality: 32,
            metadata: 0,
            destFolder: IOFolder?.input?.nativePath, //destFolder.nativePath,
            sRGB: true,
            openWindow: false,
            _options: {dialogOptions: 'dontDisplay'},
          },
        ],
        {}
      );

      await hostControl.resumeHistory(suspensionID, true);
      const file = rand_name + '.png';

      setTimeout(() => {
        const workflow_data = inpaintingProcessor(text_prompt, file);
        sendWorkflowDataToServer(workflow_data, uuid);
      }, 500);
    },
    {'commandName': 'preparing inpainting'}
  );
}

export function generateImage(style: STYLE, prompt: string, size: any[], uuid: string) {
  const positive_prompt = style ? style.prompt.replace('{prompt}', prompt) : prompt;
  const negative_prompt = style ? style.negative_prompt : 'text, watermark, embedding:JuggernautNegative-neg';

  const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

  const data = {
    '118': {
      'inputs': {
        'ckpt_name': 'juggernaut_aftermath.safetensors',
      },
      'show': false,
      'title': 'Load Checkpoint',
      'class_type': 'CheckpointLoaderSimple',
    },
    '119': {
      'inputs': {
        'add_noise': true,
        'noise_seed': seed,
        'cfg': 1,
        'model': ['179', 0],
        'positive': ['121', 0],
        'negative': ['122', 0],
        'sampler': ['123', 0],
        'sigmas': ['177', 0],
        'latent_image': ['120', 0],
      },
      'show': false,
      'title': 'SamplerCustom',
      'class_type': 'SamplerCustom',
    },
    '120': {
      'inputs': {
        'width': size[0],
        'height': size[1],
        'batch_size': 1,
      },
      'show': false,
      'title': 'Empty Latent Image',
      'class_type': 'EmptyLatentImage',
    },
    '121': {
      'inputs': {
        'text': positive_prompt,
        'clip': ['118', 1],
      },
      'show': false,
      'title': 'CLIP Text Encode (Prompt)',
      'class_type': 'CLIPTextEncode',
    },
    '122': {
      'inputs': {
        'text': negative_prompt,
        'clip': ['118', 1],
      },
      'show': false,
      'title': 'CLIP Text Encode (Prompt)',
      'class_type': 'CLIPTextEncode',
    },
    '123': {
      'inputs': {
        'sampler_name': 'lcm',
      },
      'show': false,
      'title': 'KSamplerSelect',
      'class_type': 'KSamplerSelect',
    },
    '125': {
      'inputs': {
        'samples': ['119', 0],
        'vae': ['118', 2],
      },
      'show': false,
      'title': 'VAE Decode',
      'class_type': 'VAEDecode',
    },
    '177': {
      'inputs': {
        'scheduler': 'sgm_uniform',
        'steps': 4,
        'model': ['179', 0],
      },
      'show': false,
      'title': 'BasicScheduler',
      'class_type': 'BasicScheduler',
    },
    '179': {
      'inputs': {
        'lora_name': 'lcm_sd15_pytorch_lora_weights.safetensors',
        'strength_model': 1,
        'model': ['118', 0],
      },
      'show': false,
      'title': 'LoraLoaderModelOnly',
      'class_type': 'LoraLoaderModelOnly',
    },
    '180': {
      'inputs': {
        'filename_prefix': 'QuickGen',
        'images': ['125', 0],
      },
      'show': false,
      'title': 'Save Image',
      'class_type': 'SaveImage',
    },
  };

  sendWorkflowDataToServer(data, uuid);
}
