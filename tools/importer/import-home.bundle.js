/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document }) {
    let videoUrl = "";
    const settingsHost = element.matches("[data-settings]") ? element : element.querySelector("[data-settings]");
    if (settingsHost) {
      try {
        const settings = JSON.parse(settingsHost.getAttribute("data-settings") || "{}");
        if (settings.background_video_link) videoUrl = settings.background_video_link;
      } catch (e) {
      }
    }
    if (!videoUrl) {
      const iframe = element.querySelector('.elementor-background-video-container iframe[src], iframe[src*="vimeo"], iframe[src*="youtube"]');
      if (iframe) {
        const src = iframe.getAttribute("src");
        const vimeo = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        videoUrl = vimeo ? `https://vimeo.com/${vimeo[1]}` : src;
      }
    }
    if (!videoUrl) {
      const video = element.querySelector("video source[src], video[src]");
      if (video) videoUrl = video.getAttribute("src");
    }
    const poster = [...element.querySelectorAll("img")].find((img) => !img.closest(".elementor-widget-text-editor"));
    const textNodes = [];
    element.querySelectorAll(".elementor-widget-text-editor .elementor-widget-container").forEach((container) => {
      const blocks = container.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p, :scope > ul, :scope > ol");
      if (blocks.length) {
        blocks.forEach((node) => textNodes.push(node));
      } else if (container.textContent.trim()) {
        const p = document.createElement("p");
        p.innerHTML = container.innerHTML.trim();
        textNodes.push(p);
      }
    });
    element.querySelectorAll(".elementor-widget-button a.elementor-button[href]").forEach((btn) => {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = btn.getAttribute("href");
      a.textContent = btn.textContent.trim();
      p.append(a);
      textNodes.push(p);
    });
    const cells = [];
    if (poster) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(" field:image "));
      frag.appendChild(poster);
      cells.push([frag]);
    } else {
      cells.push([""]);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    textNodes.forEach((node) => textFrag.appendChild(node));
    if (videoUrl) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = videoUrl;
      a.textContent = videoUrl;
      p.append(a);
      textFrag.appendChild(p);
    }
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tiles.js
  var FALLBACK_BG = {
    "9c67a4b": "https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-2.jpg",
    "109f75e": "https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-1.jpg",
    a6eeed4: "https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-4.jpg",
    a264488: "https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-3.jpg"
  };
  function urlFromCss(value) {
    if (!value || value === "none") return "";
    const m = value.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
    return m ? m[1] : "";
  }
  function getBackgroundUrl(tile, document) {
    const inline = urlFromCss(tile.style && tile.style.backgroundImage);
    if (inline) return inline;
    try {
      const settings = JSON.parse(tile.getAttribute("data-settings") || "{}");
      if (settings.background_image && settings.background_image.url) return settings.background_image.url;
    } catch (e) {
    }
    try {
      const view = document.defaultView;
      if (view && view.getComputedStyle) {
        const computed = urlFromCss(view.getComputedStyle(tile).backgroundImage);
        if (computed) return computed;
      }
    } catch (e) {
    }
    const idClass = [...tile.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
    if (idClass) {
      const id = idClass.replace("elementor-element-", "");
      if (FALLBACK_BG[id]) return FALLBACK_BG[id];
    }
    return "";
  }
  function parse2(element, { document }) {
    let tiles = [...element.querySelectorAll(":scope > a.e-con, :scope > .e-con-inner > a.e-con")];
    if (!tiles.length) tiles = [...element.querySelectorAll("a[href]")].filter((a) => a.querySelector(".title-services, p"));
    const cells = [];
    tiles.forEach((tile) => {
      const labelEl = tile.querySelector(".title-services p, .title-services .elementor-widget-container, p");
      const labelText = (labelEl ? labelEl.textContent : tile.textContent).replace(/\s+/g, " ").trim();
      let img = tile.querySelector("img");
      if (!img) {
        const src = getBackgroundUrl(tile, document);
        if (src) {
          img = document.createElement("img");
          img.src = src;
          img.alt = labelText;
        }
      }
      let imageCell = "";
      if (img) {
        imageCell = document.createDocumentFragment();
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = tile.getAttribute("href") || "";
      a.textContent = labelText;
      p.append(a);
      textCell.appendChild(p);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tiles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-overlay.js
  var FALLBACK_BG2 = {
    e274826: "https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-home-investments-2.jpg",
    "1391f39": "https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-produto-3.jpg",
    f9193f1: "https://bradescobank.com/wp-content/uploads/2026/08/thumb-bradesco-credit-home-1.webp",
    "3618faf": "https://bradescobank.com/wp-content/uploads/2025/12/home-zelle-2.webp"
  };
  function urlFromCss2(value) {
    if (!value || value === "none") return "";
    const m = value.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
    return m ? m[1] : "";
  }
  function getBackgroundImage(card, document) {
    const direct = card.querySelector(":scope > img");
    if (direct) return direct;
    let src = urlFromCss2(card.style && card.style.backgroundImage);
    if (!src) {
      try {
        const view = document.defaultView;
        if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(card).backgroundImage);
      } catch (e) {
      }
    }
    if (!src) {
      const idClass = [...card.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
      if (idClass) src = FALLBACK_BG2[idClass.replace("elementor-element-", "")] || "";
    }
    if (!src) return null;
    const img = document.createElement("img");
    img.src = src;
    return img;
  }
  function parse3(element, { document }) {
    let cards = [...element.querySelectorAll(":scope > .e-con.e-child, :scope > .e-con-inner > .e-con.e-child")];
    if (!cards.length) cards = [...element.querySelectorAll(".e-con.e-child")].filter((c) => c.querySelector(".discovery-product"));
    const cells = [];
    cards.forEach((card) => {
      const bg = getBackgroundImage(card, document);
      const titleEl = card.querySelector("h1, h2, h3, h4");
      if (bg && !bg.getAttribute("alt") && titleEl) bg.alt = titleEl.textContent.replace(/\s+/g, " ").trim();
      let imageCell = "";
      if (bg) {
        imageCell = document.createDocumentFragment();
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(bg);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      const widgets = [...card.querySelectorAll(".elementor-widget")].filter((w) => !w.parentElement.closest(".elementor-widget"));
      widgets.forEach((widget) => {
        const container = widget.querySelector(".elementor-widget-container") || widget;
        if (widget.classList.contains("elementor-widget-button")) {
          const btn = container.querySelector("a[href]");
          if (!btn) return;
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = btn.getAttribute("href");
          a.textContent = btn.textContent.replace(/\s+/g, " ").trim();
          p.append(a);
          textCell.appendChild(p);
        } else if (widget.classList.contains("elementor-widget-image")) {
          const img = container.querySelector("img");
          if (!img) return;
          const p = document.createElement("p");
          p.append(img);
          textCell.appendChild(p);
        } else if (widget.classList.contains("elementor-widget-text-editor")) {
          const blocks = [...container.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > ul, :scope > ol")];
          if (blocks.length) {
            blocks.forEach((node) => {
              if (/^H[1-6]$/.test(node.tagName)) {
                const h = document.createElement(node.tagName.toLowerCase());
                h.innerHTML = node.innerHTML.replace(/&nbsp;| /g, " ").trim();
                textCell.appendChild(h);
              } else {
                textCell.appendChild(node);
              }
            });
          } else if (container.textContent.trim()) {
            const p = document.createElement("p");
            p.innerHTML = container.innerHTML.trim();
            textCell.appendChild(p);
          }
        }
      });
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-overlay", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  var FALLBACK_BG3 = {
    f4e421d: "https://bradescobank.com/wp-content/uploads/2024/10/bg-Exclusive-1.jpg"
  };
  function urlFromCss3(value) {
    if (!value || value === "none") return "";
    const m = value.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
    return m ? m[1] : "";
  }
  function getBackgroundImage2(element, document) {
    const direct = element.querySelector(":scope > img, :scope > .e-con-inner > img");
    if (direct) return direct;
    let src = urlFromCss3(element.style && element.style.backgroundImage);
    if (!src) {
      try {
        const view = document.defaultView;
        if (view && view.getComputedStyle) src = urlFromCss3(view.getComputedStyle(element).backgroundImage);
      } catch (e) {
      }
    }
    if (!src) {
      const idClass = [...element.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
      if (idClass) src = FALLBACK_BG3[idClass.replace("elementor-element-", "")] || "";
    }
    if (!src) return null;
    const img = document.createElement("img");
    img.src = src;
    return img;
  }
  function parse4(element, { document }) {
    const cells = [];
    const bg = getBackgroundImage2(element, document);
    const heading = element.querySelector("h1, h2, h3, h4");
    if (bg && !bg.getAttribute("alt") && heading) bg.alt = heading.innerHTML.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (bg) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(" field:image "));
      frag.appendChild(bg);
      cells.push([frag]);
    } else {
      cells.push([""]);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    const widgets = [...element.querySelectorAll(".elementor-widget")].filter((w) => !w.parentElement.closest(".elementor-widget"));
    widgets.forEach((widget) => {
      const container = widget.querySelector(".elementor-widget-container") || widget;
      if (widget.classList.contains("elementor-widget-button")) {
        const btn = container.querySelector("a[href]");
        if (!btn) return;
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = btn.getAttribute("href");
        a.textContent = btn.textContent.replace(/\s+/g, " ").trim();
        p.append(a);
        textFrag.appendChild(p);
      } else if (widget.classList.contains("elementor-widget-text-editor")) {
        const blocks = [...container.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > ul, :scope > ol")];
        if (blocks.length) {
          blocks.forEach((node) => textFrag.appendChild(node));
        } else if (container.textContent.trim()) {
          const p = document.createElement("p");
          p.innerHTML = container.innerHTML.trim();
          textFrag.appendChild(p);
        }
      }
    });
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/bradescobank-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#cookie-notice",
        // Cookie Notice plugin banner
        "access-widget-ui",
        // accessiBe widget hosts
        ".acsb-sr-only",
        // accessiBe screen-reader guide link
        ".acsb-trigger",
        // accessiBe trigger button
        ".ct-drawer-canvas",
        // Blocksy off-canvas drawer (mobile menu)
        ".skip-link",
        // "Skip to content" link
        ".otgs-development-site-front-end",
        // WPML dev-site notice
        "#elementor-device-mode"
      ]);
      WebImporter.DOMUtils.remove(element, [".elementor-hidden-desktop"]);
      WebImporter.DOMUtils.remove(element, [
        ".elementor-element-df3b3d3",
        ".elementor-element-1191c87"
      ]);
      element.querySelectorAll("iframe").forEach((iframe) => {
        if (!iframe.getAttribute("src")) iframe.remove();
      });
      element.querySelectorAll('img[src^="data:image/svg+xml"]').forEach((img) => {
        if (!img.closest("main")) img.remove();
      });
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#header",
        "header.ct-header",
        "footer.elementor.elementor-6228",
        "nav.mobile-menu",
        "script",
        "style",
        "noscript",
        "link",
        "iframe:not([src])"
      ]);
      element.querySelectorAll("[data-elementor-device-mode], [data-header], [data-footer], [data-link], [data-prefix]").forEach((el) => {
        ["data-elementor-device-mode", "data-header", "data-footer", "data-link", "data-prefix"].forEach((attr) => el.removeAttribute(attr));
      });
    }
  }

  // tools/importer/transformers/bradescobank-sections.js
  var MARKER_ATTR = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el) continue;
        if (i > 0 || section.style) {
          const hr = document.createElement("hr");
          if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
          if (i === 0) hr.setAttribute("data-excat-first-section", "true");
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        const el = findSectionElement(element, section);
        if (el) {
          el.after(metadata);
        } else if (marker) {
          marker.after(metadata);
        }
        if (marker) {
          marker.removeAttribute(MARKER_ATTR);
          if (marker.hasAttribute("data-excat-first-section")) marker.remove();
        }
      }
      element.querySelectorAll("hr[data-excat-first-section]").forEach((hr) => hr.remove());
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    name: "home",
    urls: [
      "https://bradescobank.com/en/"
    ],
    representativeUrl: "https://bradescobank.com/en/",
    description: "Bradesco Bank homepage: background-video heroes, segment tiles, product overlay cards and promo banner",
    urlPattern: "/*",
    blocks: [
      { name: "hero-video", instances: [".elementor-element-b079a4a", ".elementor-element-e5bf88e"] },
      { name: "cards-tiles", instances: [".elementor-element-6ff733d", "section.services"] },
      { name: "cards-overlay", instances: [".elementor-element-c28d200", ".elementor-element-6cab8f9"] },
      { name: "hero-banner", instances: [".elementor-element-f4e421d"] }
    ],
    sections: [
      { id: "rc3", name: "Hero (background video)", selector: [".elementor-element-b079a4a"], style: null, blocks: ["hero-video"], defaultContent: [] },
      { id: "rc5", name: "Tailored offerings intro", selector: [".elementor-element-c766b99"], style: "centered", blocks: [], defaultContent: [".elementor-element-37e512d h2"] },
      { id: "rc6", name: "Client segment tiles", selector: [".elementor-element-6ff733d", "section.services"], style: null, blocks: ["cards-tiles"], defaultContent: [] },
      { id: "rc8", name: "Solutions statement (background video)", selector: [".elementor-element-e5bf88e"], style: null, blocks: ["hero-video"], defaultContent: [] },
      { id: "rc9", name: "Products intro", selector: [".elementor-element-0faff3c"], style: "centered", blocks: [], defaultContent: [".elementor-element-147aee5 h2"] },
      { id: "rc10", name: "Product cards row 1", selector: [".elementor-element-c28d200"], style: null, blocks: ["cards-overlay"], defaultContent: [] },
      { id: "rc11", name: "Product cards row 2", selector: [".elementor-element-6cab8f9"], style: null, blocks: ["cards-overlay"], defaultContent: [] },
      { id: "rc12", name: "Market trends intro", selector: [".elementor-element-3326291"], style: "centered", blocks: [], defaultContent: [".elementor-element-69c93f6 h2"] },
      { id: "rc13", name: "Exclusive content banner", selector: [".elementor-element-f4e421d"], style: null, blocks: ["hero-banner"], defaultContent: [] }
    ]
  };
  var parsers = {
    "hero-video": parse,
    "cards-tiles": parse2,
    "cards-overlay": parse3,
    "hero-banner": parse4
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const { pathname } = new URL(params.originalURL);
      let rawPath = pathname.replace(/\.html?$/, "");
      if (rawPath.endsWith("/")) rawPath = `${rawPath}index`;
      const path = WebImporter.FileUtils.sanitizePath(rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
