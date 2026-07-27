# Kazu VIZ Scene Editor

Esta versão foi construída diretamente a partir do arquivo `Visualizer DJ FKU.viz` enviado.

- `scene.json`: árvore original com 43 composições e 98 elementos.
- `assets/`: todos os sete recursos locais extraídos do `.viz`.
- O editor permite substituir cada mídia e controlar camadas e efeitos.

## Importante
Os recursos incorporados no `.viz` são placeholders diferentes dos vistos no vídeo: o arquivo contém, por exemplo, “ADDICTION” e outra personagem. O vídeo foi exportado após substituir esses slots no Avee. Para reproduzir exatamente a arte do vídeo, substitua os slots pelas imagens usadas naquela exportação.

Execute por HTTP:

```bash
python3 -m http.server 8080
```
