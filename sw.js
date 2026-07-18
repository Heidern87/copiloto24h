const CACHE_NAME = 'copiloto-24h-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './copiloto_24h.png'
];

// Instalação do Service Worker e armazenamento dos arquivos estruturais no Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network-First com Fallback para Cache (Garante que se você alterar o HTML, ele atualize)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a rede responder, atualiza o cache e retorna a resposta fresca
        if (response && response.status === 200) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
        }
        return response;
      })
      .catch(() => {
        // Se a rede falhar (offline), busca a estrutura direto do cache interno
        return caches.match(event.request);
      })
  );
});
