import React, { useEffect } from 'react';
import { Platform } from 'react-native';

/** Script externo do governo (vlibras.gov.br): so o que usamos. */
interface VLibrasApi {
  Widget: new (url: string) => unknown;
  widget?: { hide?: () => void };
}
type VLibrasWindow = Window & { VLibras?: VLibrasApi };
const VLIBRAS_SCRIPT_URL = 'https://vlibras.gov.br/app/vlibras-plugin.js';
const VLIBRAS_CONTAINER_ID = 'vlibras-container-manual';

const VLibrasSetup: React.FC = () => {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const body = document.body;

    let containerDiv = document.getElementById(VLIBRAS_CONTAINER_ID);

    if (!containerDiv) {
      containerDiv = document.createElement('div');
      containerDiv.id = VLIBRAS_CONTAINER_ID;
      containerDiv.innerHTML = `
                <style>
                    /* Oculta o ícone flutuante padrão que o VLibras injeta */
                    .accessible-icon-button { display: none !important; }
                    /* Oculta o boneco 3D na inicialização */
                    #vlibras-widget { visibility: hidden !important; }
                </style>
                <div vw class="enabled">
                    <div vw-access-button class="active"></div>
                    <div vw-plugin-wrapper>
                        <div class="vw-plugin-top-wrapper"></div>
                    </div>
                </div>
            `;
      body.appendChild(containerDiv);

      const script = document.createElement('script');
      script.src = VLIBRAS_SCRIPT_URL;
      script.async = true;

      script.onload = () => {
        const vlibras = (window as VLibrasWindow).VLibras;
        if (vlibras) {
          new vlibras.Widget('https://vlibras.gov.br/app');

          const widget = vlibras.widget;
          if (widget && widget.hide) {
            widget.hide();
          }
        }
      };

      body.appendChild(script);
    }
  }, []);

  return null;
};

export default VLibrasSetup;
