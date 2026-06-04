import React, { useState, useEffect, useCallback, useRef, useMemo} from 'react';
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import JoditEditor from 'jodit-react';
import DOMPurify from 'dompurify';
import moment from 'moment';
import Cropper from 'react-easy-crop';

// 🆕 File conversion libraries
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

import {
  Button, Modal, Form, Input, Popconfirm, Card,
  Typography, Avatar, Row, Col, Space,
  message, notification, Tooltip, Grid, Select,
  Upload, Tabs, Alert, Switch, Slider, Skeleton, Spin,
} from 'antd';
import {
  PlusOutlined, FileTextOutlined, DeleteOutlined,
  EditOutlined, SearchOutlined, CheckCircleOutlined, SyncOutlined,
  UserOutlined, PictureOutlined, EyeOutlined, ClockCircleOutlined,
  UndoOutlined, ScissorOutlined, ZoomInOutlined, BookOutlined, CalendarOutlined,
  RocketOutlined, TagOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined,
  AppstoreAddOutlined, LoadingOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { TextArea } = Input;
// const { TabPane } = Tabs;  

// ─────────────────────────────────────────────
//  DESIGN TOKENS (unchanged)
// ─────────────────────────────────────────────
const THEME = {
  primary: '#6d28d9',
  primaryLight: '#8b5cf6',
  primaryDark: '#4c1d95',
  accent: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  surface: '#ffffff',
  bg: '#f8fafc',
  border: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
};

// ─────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────
const GLOBAL_STYLES = `
@import url('https://fonts.bunny.net/css?family=playfair-display:600,600i,700,700i,800,800i|plus-jakarta-sans:400,500,600,700,800&display=swap');

  .bm-root * { box-sizing: border-box; }
  .bm-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f8fafc;
    min-height: 100vh;
    padding: 32px 40px;
    color: #0f172a;
  }

  .bm-header {
    display: flex; justify-content: space-between; align-items: flex-end;
    margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
  }
  .bm-header-title {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 28px !important; font-weight: 800 !important;
    color: #0f172a !important; margin: 0 !important;
    line-height: 1.2 !important; letter-spacing: -0.5px !important;
    display: flex; align-items: center; gap: 10px;
  }
  .bm-header-sub { font-size: 14px; color: #64748b; margin-top: 4px; font-weight: 500; }

  .bm-btn-primary {
    background: #6d28d9 !important; border: none !important;
    height: 44px !important; padding: 0 24px !important;
    border-radius: 10px !important; font-weight: 600 !important;
    font-size: 14px !important; box-shadow: 0 4px 12px rgba(109,40,217,.2) !important;
    transition: all .2s ease !important;
  }
  .bm-btn-primary:hover {
    background: #5b21b6 !important; transform: translateY(-1px) !important;
    box-shadow: 0 6px 16px rgba(109,40,217,.3) !important;
  }

  .bm-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 32px; }
  .bm-stat-card {
    background: #fff; border-radius: 16px; padding: 24px;
    border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,.02);
    display: flex; flex-direction: column; justify-content: center; transition: all .2s ease;
  }
  .bm-stat-card:hover { box-shadow: 0 10px 24px rgba(0,0,0,.06); border-color: #cbd5e1; transform: translateY(-2px); }
  .bm-stat-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .bm-stat-label { font-size: 14px; color: #64748b; font-weight: 600; }
  .bm-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .bm-stat-icon.purple { background: #f5f3ff; color: #6d28d9; }
  .bm-stat-icon.green  { background: #ecfdf5; color: #10b981; }
  .bm-stat-icon.amber  { background: #fffbeb; color: #f59e0b; }
  .bm-stat-icon.blue   { background: #eff6ff; color: #3b82f6; }
  .bm-stat-value { font-family: 'Plus Jakarta Sans',sans-serif; font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1; letter-spacing: -0.5px; }

  .bm-filters {
    background: #fff; border-radius: 16px; padding: 16px 20px;
    border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,.02);
    margin-bottom: 24px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
  }
  .bm-filters .ant-input-affix-wrapper, .bm-filters .ant-select-selector {
    border-radius: 10px !important; border-color: #e2e8f0 !important;
    height: 42px !important; font-weight: 500; font-family: 'Plus Jakarta Sans',sans-serif;
  }

  .bm-blog-card {
    background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
    overflow: hidden; margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,.02); transition: all .25s ease;
    display: flex; min-height: 220px;
  }
  .bm-blog-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,.06); transform: translateY(-2px); border-color: #cbd5e1; }
  .bm-blog-thumb { width: 260px; min-width: 260px; background: #f1f5f9; position: relative; overflow: hidden; flex-shrink: 0; }
  .bm-blog-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
  .bm-blog-card:hover .bm-blog-thumb img { transform: scale(1.03); }
  .bm-blog-body { padding: 24px 28px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .bm-blog-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
  .bm-blog-badges { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .bm-cat-tag { background: #f1f5f9 !important; color: #475569 !important; border: 1px solid #e2e8f0 !important; border-radius: 6px !important; font-size: 12px !important; font-weight: 600 !important; padding: 4px 10px !important; }
  .bm-status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
  .bm-status-badge.published { background: #ecfdf5; color: #10b981; }
  .bm-status-badge.draft     { background: #fffbeb; color: #f59e0b; }
  .bm-blog-actions { display: flex; gap: 8px; }
  .bm-action-btn {
    width: 36px !important; height: 36px !important; border-radius: 8px !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    border: 1px solid #e2e8f0 !important; background: #fff !important; color: #64748b !important;
    font-size: 15px !important; transition: all .2s !important; cursor: pointer; padding: 0 !important;
  }
  .bm-action-btn:hover { background: #f8fafc !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
  .bm-action-btn.danger:hover { background: #fef2f2 !important; border-color: #fca5a5 !important; color: #ef4444 !important; }
  .bm-blog-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; line-height: 1.3; letter-spacing: -0.3px; }
  .bm-blog-excerpt { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .bm-blog-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .bm-tag { font-size: 12px !important; border-radius: 6px !important; background: #f8fafc !important; border-color: #e2e8f0 !important; color: #6d28d9 !important; padding: 2px 8px !important; font-weight: 500 !important; }
  .bm-blog-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; gap: 12px; }
  .bm-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; font-weight: 500; }
  .bm-meta-item strong { color: #0f172a; font-weight: 600; }

  .bm-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px -10px rgba(0,0,0,.1) !important; }
  .bm-modal .ant-modal-header { background: #ffffff !important; padding: 24px 32px 20px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }
  .bm-modal .ant-modal-title { color: #0f172a !important; font-family: 'Plus Jakarta Sans',sans-serif !important; font-size: 18px !important; font-weight: 700 !important; }
  .bm-modal .ant-modal-close-x { color: #64748b !important; font-size: 16px; }
  .bm-modal .ant-modal-body { padding: 24px 32px !important; max-height: 78vh; overflow-y: auto; }

  .bm-footer-bar { display: flex; justify-content: space-between; align-items: center; padding: 20px 0 0; border-top: 1px solid #f1f5f9; margin-top: 12px; }
  .bm-save-draft-btn { height: 44px !important; padding: 0 24px !important; border-radius: 10px !important; border-color: #cbd5e1 !important; color: #475569 !important; font-weight: 600 !important; background: #fff !important; font-size: 14px !important; }
  .bm-publish-btn { height: 44px !important; padding: 0 28px !important; border-radius: 10px !important; background: #6d28d9 !important; border: none !important; font-weight: 600 !important; font-size: 14px !important; color: #fff !important; }

  /* IMPORT ZONE */
  .bm-import-zone {
    border: 1px solid #e2e8f0; border-radius: 12px;
    background: #ffffff; overflow: hidden; margin-bottom: 16px;
  }
  .bm-import-zone-top {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-bottom: 0.5px solid #f1f5f9;
    gap: 12px; flex-wrap: wrap;
  }
  .bm-import-zone-left { display: flex; align-items: center; gap: 12px; }
  .bm-import-icon {
    width: 34px; height: 34px; border-radius: 8px;
    background: #eff6ff; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0;
  }
  .bm-import-icon svg { width: 16px; height: 16px; stroke: #3b82f6; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .bm-import-zone-title { font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 2px; }
  .bm-import-zone-sub { font-size: 12px; color: #64748b; margin: 0; font-weight: 400; }
  .bm-import-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
    background: #ffffff; color: #0f172a;
    font-size: 13px; font-weight: 600;
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .bm-import-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
  .bm-import-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .bm-import-btn svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .bm-formats-row {
    display: flex; align-items: center; gap: 6px; padding: 10px 16px;
    flex-wrap: wrap; border-bottom: 0.5px solid #f1f5f9;
  }
  .bm-formats-label { font-size: 11px; color: #94a3b8; font-weight: 500; margin-right: 2px; letter-spacing: 0.2px; }
  .bm-format-badge {
    font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px;
    letter-spacing: 0.2px; display: inline-flex; align-items: center; gap: 4px;
  }
  .bm-format-badge.docx { background: #dbeafe; color: #1d4ed8; }
  .bm-format-badge.pdf  { background: #fee2e2; color: #b91c1c; }
  .bm-format-badge.txt  { background: #f1f5f9; color: #475569; }
  .bm-format-badge.html { background: #fef3c7; color: #92400e; }
  .bm-format-badge.md   { background: #dcfce7; color: #166534; }
  .bm-format-badge.rtf  { background: #f5f3ff; color: #5b21b6; }
  .bm-import-paste-hint {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #f8fafc;
    font-size: 11px; color: #94a3b8; font-weight: 500;
  }
  .bm-import-paste-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; flex-shrink: 0; }

  /* PREVIEW MODAL */
  .preview-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; }
  .preview-modal .ant-modal-header { background: #ffffff !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; padding: 20px 32px !important; }
  .preview-modal .ant-modal-title { color: #0f172a !important; font-weight: 700 !important; font-family: 'Plus Jakarta Sans',sans-serif !important; font-size: 18px !important; }
  .preview-modal .ant-modal-body { padding: 0 !important; max-height: 78vh; overflow-y: auto; }

  /* BLOG PREVIEW CONTENT */
  .blog-preview-wrap { font-family: 'DM Sans',sans-serif; color: #0f172a; background: #fff; }
  .blog-preview-hero { width: 100%; height: 360px; object-fit: cover; display: block; border-bottom: 1px solid #e2e8f0; }
  .blog-preview-inner { padding: 48px 56px; max-width: 860px; margin: 0 auto; }
  .blog-preview-content ul { list-style-type: disc !important; padding-left: 2.2em !important; margin: 0 0 1.5em 0 !important; display: block !important; }
.blog-preview-content ol { list-style-type: decimal; padding-left: 2.2em !important; margin: 0 0 1.5em 0 !important; display: block !important; }
  .blog-preview-content li { display: list-item !important; list-style-position: outside !important; margin: 0 0 .6em 0 !important; line-height: 1.8; color: #334155; font-size: 17px; }
  .blog-preview-content h1 { font-family: 'Playfair Display',serif; font-size: 2.4em; font-weight: 800; margin: 1.4em 0 .5em !important; line-height: 1.2; color: #0f172a; display: block; letter-spacing: -0.5px; }
  .blog-preview-content h2 { font-family: 'Playfair Display',serif; font-size: 1.8em; font-weight: 700; margin: 1.2em 0 .4em !important; line-height: 1.3; color: #0f172a; display: block; letter-spacing: -0.5px; }
  .blog-preview-content h3 { font-family: 'Playfair Display',serif; font-size: 1.4em; font-weight: 700; margin: 1em 0 .3em !important; color: #334155; display: block; }
  .blog-preview-content p { margin: 0 0 1.2em 0 !important; line-height: 1.85; font-size: 17px; color: #334155; display: block; }
  .blog-preview-content blockquote { border-left: 4px solid #6d28d9; padding: 16px 24px; margin: 1.5em 0 !important; background: #f8fafc; border-radius: 0 8px 8px 0; font-style: italic; color: #475569; font-size: 18px; font-family: 'Playfair Display',serif; }
  .blog-preview-content a { color: #6d28d9; text-decoration: underline; font-weight: 600; }
  .blog-preview-content img { max-width: 100%; border-radius: 12px; margin: 1.5em 0 !important; }
  .blog-preview-content strong, .blog-preview-content b { font-weight: 700 !important; color: #0f172a !important; }
  .blog-preview-content em, .blog-preview-content i { font-style: italic !important; }
  .blog-preview-content u { text-decoration: underline !important; }
  .blog-preview-content s, .blog-preview-content strike { text-decoration: line-through !important; }

  /* PAGINATION */
  .bm-pagination { display: flex; justify-content: space-between; align-items: center; padding: 24px 0; flex-wrap: wrap; gap: 12px; }
  .bm-page-info { font-size: 14px; color: #64748b; font-weight: 500; }
  .bm-page-btns { display: flex; gap: 8px; flex-wrap: wrap; }
  .bm-page-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #475569; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; }
  .bm-page-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
  .bm-page-btn.active { background: #6d28d9; border-color: #6d28d9; color: #fff; }
  .bm-page-btn:disabled { opacity: .4; cursor: not-allowed; }

  /* EMPTY STATE */
  .bm-empty { text-align: center; padding: 80px 20px; }
  .bm-empty-icon { font-size: 48px; color: #cbd5e1; margin-bottom: 16px; }
  .bm-empty-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
  .bm-empty-sub { font-size: 14px; color: #64748b; }

  /* RESPONSIVE */
  @media (max-width: 992px) {
    .bm-stats { grid-template-columns: repeat(2,1fr); }
    .bm-blog-card { flex-direction: column; }
    .bm-blog-thumb { width: 100%; min-width: unset; height: 200px; }
    .blog-preview-inner { padding: 32px 40px; }
  }
  @media (max-width: 768px) {
    .bm-root { padding: 16px; }
    .bm-header { flex-direction: column; align-items: flex-start; }
    .bm-header-title { font-size: 24px !important; }
    .bm-header > button { width: 100%; }
    .bm-filters { flex-direction: column; align-items: stretch; }
    .bm-filters > * { width: 100% !important; max-width: none !important; }
    .bm-modal .ant-modal-body { padding: 20px !important; }
    .bm-modal .ant-modal-header { padding: 20px !important; }
    .blog-preview-inner { padding: 24px 20px; }
    .blog-preview-content h1 { font-size: 2em; }
    .blog-preview-hero { height: 240px; }
    .bm-footer-bar { flex-direction: column; align-items: stretch; gap: 16px; }
    .bm-save-draft-btn, .bm-publish-btn { width: 100%; }
  }
  @media (max-width: 480px) {
    .bm-stats { grid-template-columns: 1fr; }
    .bm-blog-footer { flex-direction: column; align-items: flex-start; gap: 12px; }
    .bm-pagination { flex-direction: column; justify-content: center; gap: 16px; }
    .bm-page-btns { justify-content: center; }
  }
`;

// ═══════════════════════════════════════════════════════════════════
//  HTML CLEANING UTILITIES
// ═══════════════════════════════════════════════════════════════════
const cleanExternalHtml = (html) => {
  if (!html) return '';
  let cleaned = html
    .replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<\?xml[^?]*\?>/gi, '');

  cleaned = cleaned.replace(/<\/?\w+:\w+[^>]*>/gi, '');
  cleaned = cleaned.replace(/\s+xmlns[\w:]*="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s+lang="[^"]*"/gi, '');

  const div = document.createElement('div');
  div.innerHTML = cleaned;
  div.querySelectorAll('script,iframe,object,embed,applet,head,style,link,meta').forEach(el => el.remove());
  div.querySelectorAll('[class],[id],[name]').forEach(el => {
    el.removeAttribute('class');
    el.removeAttribute('id');
    el.removeAttribute('name');
  });

  const processNode = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    Array.from(node.children).forEach(processNode);
    const tag = node.tagName.toLowerCase();
    const style = node.getAttribute('style') || '';
    const isBold = /font-weight\s*:\s*(bold|[7-9]\d{2})/i.test(style);
    const isItalic = /font-style\s*:\s*italic/i.test(style);
    const isUnderline = /text-decoration[^;]*:\s*[^;]*underline/i.test(style);
    const isStrike = /text-decoration[^;]*:\s*[^;]*line-through/i.test(style);
    const alignMatch = style.match(/text-align\s*:\s*(left|center|right|justify)/i);
    node.removeAttribute('style');
    if (alignMatch) node.setAttribute('style', `text-align:${alignMatch[1]}`);
    if (tag === 'span' || tag === 'font') {
      const parent = node.parentNode;
      if (!parent) return;
      if (isBold || isItalic || isUnderline || isStrike) {
        let inner = node.innerHTML;
        if (isStrike)    inner = `<s>${inner}</s>`;
        if (isUnderline) inner = `<u>${inner}</u>`;
        if (isItalic)    inner = `<em>${inner}</em>`;
        if (isBold)      inner = `<strong>${inner}</strong>`;
        const temp = document.createElement('span');
        temp.innerHTML = inner;
        while (temp.firstChild) parent.insertBefore(temp.firstChild, node);
        parent.removeChild(node);
      } else {
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
      }
    }
  };
  Array.from(div.children).forEach(processNode);

  div.querySelectorAll('b').forEach(el => {
    const s = document.createElement('strong');
    s.innerHTML = el.innerHTML;
    el.parentNode?.replaceChild(s, el);
  });
  div.querySelectorAll('i').forEach(el => {
    const em = document.createElement('em');
    em.innerHTML = el.innerHTML;
    el.parentNode?.replaceChild(em, el);
  });
 div.querySelectorAll('li').forEach(li => {
  const text = li.textContent.trim();

  if (
    text &&
    !text.startsWith("•") &&
    !text.match(/^\d+\./) &&
    text.length > 80
  ) {
    const p = document.createElement("p");
    p.innerHTML = li.innerHTML;
    li.parentNode?.replaceChild(p, li);
  }
});
    

  return DOMPurify.sanitize(div.innerHTML, {
    ALLOWED_TAGS: ['p','br','strong','em','u','s','strike','del','h1','h2','h3','h4','h5','h6','ul','ol','li','a','img','blockquote','pre','code','hr','table','thead','tbody','tr','td','th','div'],
    ALLOWED_ATTR: ['href','src','alt','title','target','rel','style'],
    ALLOW_DATA_ATTR: false,
  });
};

const sanitiseRegularHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p','br','strong','b','em','i','u','s','strike','del','h1','h2','h3','h4','h5','h6','ul','ol','li','a','img','blockquote','pre','code','hr','table','thead','tbody','tr','td','th','div','span'],
    ALLOWED_ATTR: ['href','src','alt','title','target','rel','style'],
    ALLOW_DATA_ATTR: false,
  });
};

// ═══════════════════════════════════════════════════════════════════
//  MARKDOWN → HTML
// ═══════════════════════════════════════════════════════════════════
const inlineFormat = (text) =>
  text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

const markdownToHtml = (md) => {
  if (!md) return '';
  let html = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = html.split('\n');
  const out = [];
  let inUl = false, inOl = false, inPre = false, preBuffer = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (/^```/.test(line)) {
      if (!inPre) { inPre = true; preBuffer = []; }
      else { inPre = false; out.push(`<pre><code>${preBuffer.join('\n')}</code></pre>`); preBuffer = []; }
      continue;
    }
    if (inPre) { preBuffer.push(line); continue; }
    const isUl = /^[\s]*[-*+] /.test(line);
    const isOl = /^[\s]*\d+\. /.test(line);
    if (!isUl && inUl) { out.push('</ul>'); inUl = false; }
    if (!isOl && inOl) { out.push('</ol>'); inOl = false; }
    if (/^###### /.test(line)) { out.push(`<h6>${inlineFormat(line.slice(7))}</h6>`); continue; }
    if (/^##### /.test(line))  { out.push(`<h5>${inlineFormat(line.slice(6))}</h5>`); continue; }
    if (/^#### /.test(line))   { out.push(`<h4>${inlineFormat(line.slice(5))}</h4>`); continue; }
    if (/^### /.test(line))    { out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`); continue; }
    if (/^## /.test(line))     { out.push(`<h2>${inlineFormat(line.slice(3))}</h2>`); continue; }
    if (/^# /.test(line))      { out.push(`<h1>${inlineFormat(line.slice(2))}</h1>`); continue; }
    if (/^> /.test(line)) { out.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`); continue; }
    if (/^(---|\*\*\*|___)$/.test(line.trim())) { out.push('<hr>'); continue; }
    if (isUl) { if (!inUl) { out.push('<ul>'); inUl = true; } out.push(`<li>${inlineFormat(line.replace(/^[\s]*[-*+] /, ''))}</li>`); continue; }
    if (isOl) { if (!inOl) { out.push('<ol>'); inOl = true; } out.push(`<li>${inlineFormat(line.replace(/^[\s]*\d+\. /, ''))}</li>`); continue; }
    if (!line.trim()) continue;
    out.push(`<p>${inlineFormat(line)}</p>`);
  }
  if (inUl) out.push('</ul>');
  if (inOl) out.push('</ol>');
  if (inPre) out.push(`<pre><code>${preBuffer.join('\n')}</code></pre>`);
  return out.join('\n');
};

// ═══════════════════════════════════════════════════════════════════
//  RTF → PLAIN TEXT
// ═══════════════════════════════════════════════════════════════════
const rtfToText = (rtf) => {
  if (!rtf) return '';
  let text = rtf;
  text = text.replace(/\{\\info[\s\S]*?\}/gi, '');
  text = text.replace(/\{\\pict[\s\S]*?\}/gi, '');
  text = text.replace(/\\par[\s\r\n]/g, '\n\n');
  text = text.replace(/\\line[\s\r\n]/g, '\n');
  text = text.replace(/\{[^{}]*\}/g, '');
  text = text.replace(/\\[a-z]+\-?\d*\s?/gi, '');
  text = text.replace(/\\'[0-9a-f]{2}/gi, '');
  text = text.replace(/[{}\\]/g, '');
  text = text.replace(/\r\n|\r/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
};

// ═══════════════════════════════════════════════════════════════════
//  POST-PROCESS HTML
// ═══════════════════════════════════════════════════════════════════
const postProcessHtml = (html) => {
  if (!html || !html.trim()) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('script,iframe,style,link,meta,head').forEach(el => el.remove());
  div.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6').forEach(el => {
    const text = el.textContent.replace(/\u00a0/g, '').trim();
    if (!text && !el.querySelector('img, svg, picture')) el.remove();
  });
  div.querySelectorAll('ul + ul, ol + ol').forEach(list => {
    const prev = list.previousElementSibling;
    if (prev && prev.tagName === list.tagName) {
      while (list.firstChild) prev.appendChild(list.firstChild);
      list.remove();
    }
  });
  return DOMPurify.sanitize(div.innerHTML, {
    ALLOWED_TAGS: ['p','br','strong','em','u','s','del','h1','h2','h3','h4','h5','h6','ul','ol','li','a','img','blockquote','pre','code','hr','table','thead','tbody','tr','td','th'],
    ALLOWED_ATTR: ['href','src','alt','title','target','rel','style'],
    ALLOW_DATA_ATTR: false,
  });
};

// ═══════════════════════════════════════════════════════════════════
//  FILE → HTML
// ═══════════════════════════════════════════════════════════════════
const convertFileToHtml = async (file) => {
  const name = file.name || '';
  const ext = name.split('.').pop().toLowerCase();

  if (ext === 'docx') {
    let mammothLib;
    try { mammothLib = (await import('mammoth')).default; }
    catch { throw new Error('mammoth not installed. Run: npm install mammoth'); }
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammothLib.convertToHtml({ arrayBuffer }, {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title']     => h1:fresh",
        "p[style-name='Subtitle']  => h2:fresh",
        "b => strong", "i => em", "u => u", "strike => s",
      ],
      convertImage: mammothLib.images.imgElement(img =>
        img.read('base64').then(data => ({ src: `data:${img.contentType};base64,${data}` }))
      ),
      ignoreEmptyParagraphs: true,
    });
    return postProcessHtml(result.value);
  }

  if (ext === 'pdf') {
    let pdfjsLib;
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    } catch { throw new Error('pdfjs-dist not installed. Run: npm install pdfjs-dist'); }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const allLines = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const textContent = await page.getTextContent({ includeMarkedContent: false });
      const rawItems = textContent.items.filter(it => it.str?.trim());
      const yMap = {};
      rawItems.forEach(item => {
        const y = Math.round(item.transform[5]);
        if (!yMap[y]) yMap[y] = [];
        yMap[y].push(item);
      });
      Object.keys(yMap).map(Number).sort((a, b) => b - a).forEach(y => {
        const items = yMap[y];
        const text = items.map(it => it.str).join(' ').replace(/\s+/g, ' ').trim();
        if (!text) return;
        const fontSize = Math.abs(items[0]?.transform?.[3] || 12);
        const isBold = (items[0]?.fontName || '').toLowerCase().includes('bold');
        allLines.push({ text, fontSize, isBold });
      });
      allLines.push({ text: '', fontSize: 0, isBold: false, separator: true });
    }
    const sizeFreq = {};
    allLines.forEach(l => { if (l.fontSize > 0) sizeFreq[Math.round(l.fontSize)] = (sizeFreq[Math.round(l.fontSize)] || 0) + 1; });
    const bodyFontSize = parseFloat(Object.entries(sizeFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 12);
    const htmlParts = [];
    let paraBuffer = [];
    const flushPara = () => { if (!paraBuffer.length) return; htmlParts.push(`<p>${paraBuffer.join(' ')}</p>`); paraBuffer = []; };
    allLines.forEach(line => {
      if (!line.text || line.separator) { flushPara(); return; }
      const txt = line.text.trim();
      const fs  = Math.round(line.fontSize);
      const bodyFs = Math.round(bodyFontSize);
      if (fs >= bodyFs * 1.8 || (fs >= bodyFs * 1.4 && line.isBold && txt.length < 80)) { flushPara(); htmlParts.push(`<h1>${txt}</h1>`); return; }
      if (fs >= bodyFs * 1.4 || (fs >= bodyFs * 1.2 && line.isBold && txt.length < 80)) { flushPara(); htmlParts.push(`<h2>${txt}</h2>`); return; }
      if (fs >= bodyFs * 1.15 && line.isBold && txt.length < 100) { flushPara(); htmlParts.push(`<h3>${txt}</h3>`); return; }
      const bulletMatch = txt.match(/^([•·▪▸◦\-\*])\s+(.+)$/);
      const numMatch    = txt.match(/^(\d+)[.)]\s+(.+)$/);
      if (bulletMatch) { flushPara(); htmlParts.push(`<ul><li>${bulletMatch[2]}</li></ul>`); return; }
      if (numMatch)    { flushPara(); htmlParts.push(`<ol><li>${numMatch[2]}</li></ol>`); return; }
      paraBuffer.push(line.isBold ? `<strong>${txt}</strong>` : txt);
      if (/[.!?:]\s*$/.test(txt) && txt.length > 40) flushPara();
    });
    flushPara();
    return postProcessHtml(htmlParts.join('\n'));
  }

  if (ext === 'txt') {
    const text = await file.text();
    if (/^#{1,6}\s/m.test(text) || /^\s*[-*] /m.test(text)) return postProcessHtml(markdownToHtml(text));
    const html = text.split(/\n\n+/).filter(p => p.trim()).map(block => `<p>${block.trim().replace(/\n/g, ' ')}</p>`).join('\n');
    return postProcessHtml(html);
  }

  if (ext === 'html' || ext === 'htm') {
    const text = await file.text();
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return postProcessHtml(cleanExternalHtml(bodyMatch ? bodyMatch[1] : text));
  }

  if (ext === 'md' || ext === 'markdown') {
    const text = await file.text();
    return postProcessHtml(markdownToHtml(text));
  }

  if (ext === 'rtf') {
    const text = await file.text();
    const plain = rtfToText(text);
    const html = plain.split(/\n\n+/).filter(p => p.trim()).map(p => `<p>${p.replace(/\n/g, ' ')}</p>`).join('\n');
    return postProcessHtml(html);
  }

  throw new Error(`Unsupported file type: .${ext}`);
};

// ─────────────────────────────────────────────
//  HELPER UTILITIES
// ─────────────────────────────────────────────
const htmlToPlainText = (html) => {
  if (!html) return '';
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || d.innerText || '';
};

const extractHeadings = (html) => {
  if (!html) return [];
  const headings = [];
  const re = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    headings.push({ level: parseInt(m[1]), text: m[2].replace(/<[^>]*>/g, '').trim(), id: `h-${headings.length}` });
  }
  return headings;
};

const extractExcerpt = (html, maxLength = 160) => {
  if (!html) return '';
  const text = htmlToPlainText(html);
  return text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '...';
};

const smartExtract = (html) => {
  if (!html) return {};
  const text = htmlToPlainText(html).toLowerCase();
  const CATS = {
    'AI': ['artificial intelligence','machine learning','deep learning','chatgpt','llm','ai ','openai'],
    'Real Estate': ['property','real estate','housing','apartment','villa','rent','mortgage','broker'],
    'PropTech': ['proptech','property technology','smart home','iot','digital property'],
    'Technology': ['software','programming','javascript','react','cloud','saas','startup','api'],
    'Business': ['business','startup','entrepreneur','investment','revenue','marketing','sales'],
    'Mortgage': ['mortgage','home loan','refinance','interest rate','lender'],
    'Landscaping': ['landscaping','garden','outdoor','hardscape','lawn','irrigation'],
  };
  let detectedCategory = 'Other', maxMatches = 0;
  for (const [cat, kws] of Object.entries(CATS)) {
    const matches = kws.filter(kw => text.includes(kw)).length;
    if (matches > maxMatches) { maxMatches = matches; detectedCategory = cat; }
  }
  const TAGS = ['AI','Real Estate','PropTech','Technology','Business','Mortgage','Landscaping','Marketing','UAE','Dubai','Innovation','Digital','Cloud','Investment'];
  const detectedTags = TAGS.filter(t => text.includes(t.toLowerCase())).slice(0, 6);
  let excerpt = '';
  const pm = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (pm) excerpt = htmlToPlainText(pm[1]).trim().substring(0, 160);
  else if (text) excerpt = text.substring(0, 160);
  const wordCount = text.split(/\s+/).length;
  return { detectedCategory, detectedTags, excerpt, wordCount, readingTime: Math.max(1, Math.ceil(wordCount / 200)) };
};

// ─────────────────────────────────────────────
//  CROP HELPER (unchanged)
// ─────────────────────────────────────────────
const getCroppedImg = (imageSrc, pixelCrop) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas empty')), 'image/jpeg', 0.92);
  };
  image.onerror = reject;
});

// ─────────────────────────────────────────────
//  IMAGE CROP MODAL (unchanged)
// ─────────────────────────────────────────────
const ImageCropModal = ({ open, imageSrc, aspect, title, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);
  const screens = Grid.useBreakpoint();
  useEffect(() => { if (open) { setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null); } }, [open, imageSrc]);
  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setCropping(true);
    try { const blob = await getCroppedImg(imageSrc, croppedAreaPixels); onConfirm(blob); }
    catch { message.error('Crop failed, please try again'); }
    finally { setCropping(false); }
  };
  return (
    <Modal open={open} title={<Space><ScissorOutlined style={{ color: '#6d28d9' }} /><span>{title || 'Crop Image'}</span></Space>}
      onCancel={onCancel} width={screens.xs ? '98%' : 620} centered destroyOnClose className="bm-modal"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Space>
            <ZoomInOutlined style={{ color: '#888' }} />
            <Slider min={1} max={3} step={0.05} value={zoom} onChange={setZoom} style={{ width: screens.xs ? 100 : 160 }} tooltip={{ formatter: v => `${Math.round(v * 100)}%` }} />
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>{Math.round(zoom * 100)}%</Text>
          </Space>
          <Space>
            <Button onClick={onCancel} style={{ fontWeight: 600, borderRadius: 8 }}>Cancel</Button>
            <Button type="primary" icon={<ScissorOutlined />} loading={cropping} onClick={handleConfirm}
              style={{ background: THEME.primary, borderColor: THEME.primary, borderRadius: 8, fontWeight: 600 }}>
              Apply Crop
            </Button>
          </Space>
        </div>
      }>
      <div style={{ position: 'relative', width: '100%', height: screens.xs ? 280 : 380, background: '#f8fafc', borderRadius: 12, overflow: 'hidden' }}>
        {imageSrc
          ? <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, px) => setCroppedAreaPixels(px)}
              style={{ containerStyle: { borderRadius: 12 }, cropAreaStyle: { border: '2px solid #8b5cf6', boxShadow: '0 0 0 9999px rgba(0,0,0,.65)' } }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Text type="secondary">Loading image…</Text></div>}
      </div>
      <div style={{ marginTop: 12, textAlign: 'center' }}><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Drag to reposition · Scroll or slider to zoom</Text></div>
    </Modal>
  );
};

// ─────────────────────────────────────────────
//  UPLOAD WITH CROP (unchanged)
// ─────────────────────────────────────────────
const UploadWithCrop = ({ fileList, onChange, aspect, cropTitle, maxSizeMB = 5, label, extra, maxCount = 1 }) => {
  const [cropModal, setCropModal] = useState({ open: false, src: '' });
  const [pendingFile, setPendingFile] = useState(null);
  const handleBeforeUpload = (file) => {
    if (!['image/jpeg','image/png','image/jpg','image/webp'].includes(file.type)) { message.error('Only JPG, PNG, WEBP allowed'); return Upload.LIST_IGNORE; }
    if (file.size / 1024 / 1024 > maxSizeMB) { message.error(`Max ${maxSizeMB}MB`); return Upload.LIST_IGNORE; }
    const reader = new FileReader();
    reader.onload = e => { setPendingFile(file); setCropModal({ open: true, src: e.target.result }); };
    reader.readAsDataURL(file);
    return Upload.LIST_IGNORE;
  };
  const handleCropConfirm = (blob) => {
    const fileName = pendingFile?.name || 'image.jpg';
    const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
    const preview = URL.createObjectURL(blob);
    onChange([{ uid: `crop-${Date.now()}`, name: fileName, status: 'done', originFileObj: croppedFile, preview, url: preview }]);
    setCropModal({ open: false, src: '' }); setPendingFile(null);
    message.success('Image cropped!');
  };
  const handleEditCrop = (file) => {
    const src = file.url || file.preview;
    if (!src) { message.error('Cannot edit this image'); return; }
    setPendingFile(file.originFileObj || null);
    setCropModal({ open: true, src });
  };
  const itemRender = (originNode, file) => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {originNode}
      <Tooltip title="Crop / Edit">
        <button onClick={e => { e.stopPropagation(); handleEditCrop(file); }}
          style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', background: '#0f172a', border: 'none', borderRadius: 6, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', zIndex: 10 }}>
          <ScissorOutlined style={{ fontSize: 10 }} /> EDIT
        </button>
      </Tooltip>
    </div>
  );
  return (
    <>
      <Form.Item label={<span style={{ fontWeight: 600, fontSize: 14, color: THEME.text }}>{label}</span>} extra={<span style={{ fontSize: 12, color: '#64748b' }}>{extra}</span>}>
        <Upload listType="picture-card" fileList={fileList}
          onChange={({ fileList: fl }) => { if (fl.length < fileList.length) onChange(fl); }}
          beforeUpload={handleBeforeUpload} maxCount={maxCount} itemRender={itemRender}
          accept="image/jpeg,image/png,image/webp">
          {fileList.length < maxCount && (
            <div style={{ textAlign: 'center' }}>
              <PlusOutlined style={{ color: '#64748b', fontSize: 20 }} />
              <div style={{ marginTop: 8, fontSize: 12, color: '#475569', fontWeight: 600 }}>UPLOAD</div>
            </div>
          )}
        </Upload>
      </Form.Item>
      <ImageCropModal open={cropModal.open} imageSrc={cropModal.src} aspect={aspect} title={cropTitle}
        onConfirm={handleCropConfirm}
        onCancel={() => { setCropModal({ open: false, src: '' }); setPendingFile(null); }} />
    </>
  );
};

// ─────────────────────────────────────────────
//  BLOG PREVIEW COMPONENT (unchanged)
// ─────────────────────────────────────────────
const BlogPreview = ({ data }) => {
  if (!data) return null;
  const { title, subHeading, content, authorName, authorDesignation, authorImage, tags, category, featuredImage, coverImage, createdAt, readingTime, headings } = data;
  const sanitized = content ? DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p','br','strong','b','em','i','u','s','strike','del','h1','h2','h3','h4','h5','h6','ul','ol','li','a','img','blockquote','pre','code','hr','table','thead','tbody','tr','td','th','div','span'],
    ALLOWED_ATTR: ['href','src','alt','title','target','rel','style'],
    ALLOW_DATA_ATTR: false,
  }) : '';
  const heroImg = coverImage || featuredImage;
  return (
    <div className="blog-preview-wrap">
      {heroImg && <img src={heroImg} alt="cover" className="blog-preview-hero" />}
      <div className="blog-preview-inner">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {category && <span className="bm-cat-tag" style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: '1px solid #e2e8f0' }}>{category}</span>}
          {tags?.slice(0, 5).map(t => <span key={t} className="bm-tag" style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }}>#{t}</span>)}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 800, lineHeight: 1.15, color: '#0f172a', marginBottom: 16, marginTop: 0, letterSpacing: '-0.5px' }}>{title || 'Untitled Post'}</h1>
        {subHeading && <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.6, marginBottom: 28, fontStyle: 'italic', borderLeft: '4px solid #6d28d9', paddingLeft: 20, background: '#f8fafc', borderRadius: '0 8px 8px 0', padding: '16px 24px' }}>{subHeading}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: 36 }}>
          <Avatar size={54} src={authorImage} icon={<UserOutlined />} style={{ background: '#f1f5f9', color: '#64748b', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{authorName || 'Admin'}</div>
            {authorDesignation && <div style={{ fontSize: 13, color: '#6d28d9', marginTop: 2, fontWeight: 600 }}>{authorDesignation}</div>}
            <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 16, marginTop: 4 }}>
              {createdAt && <span><CalendarOutlined style={{ marginRight: 6 }} />{moment(createdAt).format('MMM DD, YYYY')}</span>}
              {readingTime && <span><ClockCircleOutlined style={{ marginRight: 6 }} />{readingTime} min read</span>}
            </div>
          </div>
        </div>
        {headings && headings.filter(h => h.level <= 3).length > 2 && (
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 32, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}><BookOutlined /> Table of Contents</div>
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              {headings.filter(h => h.level <= 3).map((h, i) => (
                <li key={i} style={{ paddingLeft: (h.level - 1) * 16, listStyle: 'decimal', marginBottom: 6, color: '#475569', fontWeight: 500 }}>{h.text}</li>
              ))}
            </ol>
          </div>
        )}
        <div className="blog-preview-content" dangerouslySetInnerHTML={{ __html: sanitized }} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  JODIT EDITOR CONFIG
// ─────────────────────────────────────────────
const getEditorConfig = () => ({
  readonly: false,
  height: 550,
  minHeight: 400,
  
  // iframe: false रखो — true होने पर बहुत से buttons टूट जाते हैं
  iframe: false,
  
  toolbarSticky: true,
  toolbarStickyOffset: 0,
  toolbarAdaptive: false,
  showCharsCounter: true,
  showWordsCounter: true,
  showXPathInStatusbar: false,

  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  defaultActionOnPaste: 'insert_as_html',
  processPasteHTML: false,

  enter: 'P',

  // ── FULL TOOLBAR ──────────────────────────────────────────────
  buttons: [
    'bold', 'italic', 'underline', 'strikethrough', '|',
    'superscript', 'subscript', '|',
    'ul', 'ol', '|',
    'outdent', 'indent', '|',
    'font', 'fontsize', 'brush', 'paragraph', '|',
    'image', 'video', 'table', 'link', '|',
    'align', '|',
    'undo', 'redo', '|',
    'hr', 'eraser', 'copyformat', '|',
    'symbol', 'fullsize', '|',
    'preview', 'print', '|',
    'source',
  ],

  buttonsMD: [
    'bold', 'italic', 'underline', '|',
    'ul', 'ol', '|',
    'font', 'fontsize', 'brush', 'paragraph', '|',
    'image', 'table', 'link', '|',
    'align', 'undo', 'redo', '|',
    'fullsize', 'source',
  ],

  buttonsSM: [
    'bold', 'italic', 'underline', '|',
    'ul', 'ol', '|',
    'image', 'link', '|',
    'align', 'undo', 'redo',
  ],

  buttonsXS: [
    'bold', 'italic', '|',
    'ul', 'ol', '|',
    'undo', 'redo',
  ],

  // ── FONT OPTIONS ─────────────────────────────────────────────
  fontValues: {
    'Plus Jakarta Sans,sans-serif': 'Plus Jakarta Sans',
    'Arial,sans-serif':             'Arial',
    'Georgia,serif':                'Georgia',
    'Times New Roman,serif':        'Times New Roman',
    'Courier New,monospace':        'Courier New',
    'Verdana,sans-serif':           'Verdana',
    'Trebuchet MS,sans-serif':      'Trebuchet MS',
    'Playfair Display,serif':       'Playfair Display',
  },

  fontSizeValues: ['8','9','10','11','12','14','16','18','20','22','24','28','32','36','40','48','56','64','72'],

  // ── COLOR PICKER ─────────────────────────────────────────────
  colorPickerDefaultTab: 'color',
  colors: {
    greyscale:  ['#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#efefef','#f3f3f3','#ffffff'],
    palette:    ['#980000','#ff0000','#ff9900','#ffff00','#00f0f0','#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff'],
    full: [
      '#e6b8a2','#dd7e6b','#cc4125','#a61c00','#85200c','#5b0f00',
      '#f9cb9c','#f6b26b','#e69138','#b45309','#783f04','#3d1f00',
      '#ffe599','#ffd966','#f1c232','#bf9000','#7f6000','#3d3d00',
      '#b6d7a8','#93c47d','#6aa84f','#38761d','#274e13','#0c2704',
      '#a4c2f4','#6d9eeb','#3c78d8','#1155cc','#1c4587','#073763',
      '#b4a7d6','#8e7cc3','#674ea7','#351c75','#20124d','#0a0033',
      '#ea9999','#e06666','#cc0000','#990000','#660000','#330000',
    ],
  },

  // ── IMAGE CONFIG ─────────────────────────────────────────────
  image: {
    openOnDblClick: true,
    editSrc: true,
    useImageEditor: false,
    editTitle: true,
    editAlt: true,
    editLink: true,
    editSize: true,
    editBorderRadius: true,
    editMargins: true,
    editStyle: true,
    editClass: false,
    editId: false,
    showPreview: true,
    selectImageAfterClose: true,
  },

  // ── LINK CONFIG ───────────────────────────────────────────────
  link: {
    openInNewTabCheckbox: true,
    noFollowCheckbox: true,
  },

  // ── TABLE CONFIG ──────────────────────────────────────────────
  table: {
    allowCellResize: true,
    useExtraClassesOptions: false,
  },

  // ── PLACEHOLDER ───────────────────────────────────────────────
  placeholder: 'Start writing your blog post here…\n\nTips:\n• Paste from Word or Google Docs — formatting is preserved\n• Use Import File button above for .docx, .pdf, .md files',

  // ── EDITOR CSS (non-iframe mode) ──────────────────────────────
  style: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize:   '16px',
    lineHeight: '1.75',
    color:      '#1e293b',
    padding:    '20px 28px',
    minHeight:  '400px',
  },

  extraCSS: `
    /* Lists */
    ul { list-style-type: disc    !important; padding-left: 28px !important; margin: 10px 0 !important; display: block !important; }
    ol { list-style-type: decimal !important; padding-left: 28px !important; margin: 10px 0 !important; display: block !important; }
    ul ul   { list-style-type: circle  !important; }
    ul ul ul { list-style-type: square !important; }
    ol ol   { list-style-type: lower-alpha !important; }
    li {
      display: list-item !important;
      list-style-position: outside !important;
      margin: 5px 0 !important;
      line-height: 1.75 !important;
      font-size: 16px !important;
    }
    li p { display: inline !important; margin: 0 !important; }

    /* Headings */
    h1 { font-size: 2em;   font-weight: 800; margin: 0.8em 0 0.4em !important; color: #0f172a; line-height: 1.2; }
    h2 { font-size: 1.6em; font-weight: 700; margin: 0.8em 0 0.35em !important; color: #0f172a; line-height: 1.3; }
    h3 { font-size: 1.3em; font-weight: 600; margin: 0.8em 0 0.3em !important;  color: #334155; }
    h4 { font-size: 1.1em; font-weight: 600; margin: 0.6em 0 0.25em !important; color: #334155; }
    h5 { font-size: 1em;   font-weight: 600; margin: 0.6em 0 0.2em !important;  color: #475569; }
    h6 { font-size: 0.9em; font-weight: 600; margin: 0.6em 0 0.2em !important;  color: #64748b; }

    /* Inline */
    strong, b { font-weight: 700  !important; color: #0f172a  !important; }
    em, i     { font-style: italic !important; }
    u         { text-decoration: underline    !important; }
    s, strike { text-decoration: line-through !important; }
    sup { vertical-align: super; font-size: 0.75em; }
    sub { vertical-align: sub;   font-size: 0.75em; }

    /* Links */
    a { color: #6d28d9; text-decoration: underline; font-weight: 500; }
    a:hover { color: #4c1d95; }

    /* Blockquote */
    blockquote {
      border-left: 4px solid #6d28d9;
      padding: 14px 22px;
      margin: 16px 0 !important;
      background: #f8fafc;
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: #475569;
      font-size: 17px;
    }

    /* Code */
    pre  { background: #1e293b; border-radius: 8px; padding: 16px 20px; overflow-x: auto; font-family: 'Courier New',monospace; font-size: 14px; color: #e2e8f0; margin: 14px 0 !important; }
    code { background: #f1f5f9; border-radius: 4px; padding: 2px 7px; font-family: 'Courier New',monospace; font-size: 14px; color: #6d28d9; }
    pre code { background: none; padding: 0; color: #e2e8f0; }

    /* Table */
    table { border-collapse: collapse; width: 100%; margin: 16px 0 !important; border-radius: 8px; overflow: hidden; }
    th { background: #6d28d9; color: #fff; font-weight: 700; padding: 12px 16px; text-align: left; font-size: 14px; }
    td { border: 1px solid #e2e8f0; padding: 10px 16px; font-size: 14px; color: #334155; }
    tr:nth-child(even) td { background: #f8fafc; }
    tr:hover td { background: #f1f5f9; }

    /* Image */
    img { max-width: 100%; border-radius: 10px; margin: 12px 0; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

    /* HR */
    hr { border: none; border-top: 2px solid #e2e8f0; margin: 24px 0 !important; }

    /* Paragraph */
    p { margin: 8px 0 !important; line-height: 1.75; }

    /* Jodit UI polish */
    .jodit-toolbar__box { border-bottom: 1px solid #e2e8f0 !important; background: #f8fafc !important; }
    .jodit-toolbar-button { border-radius: 6px !important; }
    .jodit-toolbar-button:hover { background: #ede9fe !important; color: #6d28d9 !important; }
    .jodit-toolbar-button.jodit-toolbar-button_variant_initial.jodit-toolbar-button_text-icons_true { color: #374151 !important; }
    .jodit-status-bar { background: #f8fafc !important; border-top: 1px solid #e2e8f0 !important; font-family: 'Plus Jakarta Sans', sans-serif !important; font-size: 12px !important; color: #64748b !important; }
  `,

  // ── SPELLCHECK & MISC ─────────────────────────────────────────
  spellcheck: true,
  disablePlugins: [],
  enableDragAndDropFileToEditor: true,
  uploader: { insertImageAsBase64URI: true },   // image drag-drop base64 में insert
});
// ══════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════
const BlogManagement = () => {
  const screens = useBreakpoint();
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchTimeout = useRef(null);
  const contentDebounceRef = useRef(null);
  const editorConfig = useMemo(() => getEditorConfig(), []);


  // ── FIX #1: targetStatus as a ref so handleSave always reads the
  //   correct value — useState is async and causes race conditions
  const targetStatusRef = useRef('draft');

  // ── FIX #3: editorKey increments on every modal open → forces
  //   Jodit to fully remount with fresh content each time
  const [editorKey, setEditorKey] = useState(0);

  // ── State ────────────────────────────────────────────────────────
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAs, setSavingAs] = useState('');    // 'draft' | 'published' — for button loading
  const [fileImporting, setFileImporting] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalResults: 0, itemsPerPage: 10 });
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewBlogData, setPreviewBlogData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const [contentValue, setContentValue] = useState('');
  const contentRef = useRef('');

  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [headings, setHeadings] = useState([]);
  const [smartFillApplied, setSmartFillApplied] = useState(false);
  const [pasteProcessing, setPasteProcessing] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false); // 🆕
  const [featuredImageList, setFeaturedImageList] = useState([]);
  const [coverImageList, setCoverImageList] = useState([]);
  const [authorImageList, setAuthorImageList] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, views: 0 });

  // ── FIX #4: Get Jodit instance reliably across jodit-react versions
  const getJoditInstance = useCallback(() => {
    if (!editorRef.current) return null;
    // jodit-react v3/v4: ref.current IS the Jodit instance
    // jodit-react v1/v2: ref.current.jodit
    return editorRef.current?.jodit || editorRef.current;
  }, []);

  // ── FIX #4: replaceEditorContent — sets the full editor value
  const replaceEditorContent = useCallback((html) => {
    if (!html) return;
    // Primary: use Jodit's own value setter (most reliable)
    const jodit = getJoditInstance();
    if (jodit && typeof jodit.value !== 'undefined') {
      jodit.value = html;
    }
    // Always keep React state in sync
    contentRef.current = html;
    setContentValue(html);
    setHeadings(extractHeadings(html));
  }, [getJoditInstance]);

  // ── FIX #4: insertHtmlIntoEditor — appends HTML at cursor
const insertHtmlIntoEditor = useCallback((html) => {
  if (!html) return;

  const jodit = getJoditInstance();

  if (jodit) {
    jodit.value = html;
  }

  contentRef.current = html;
  setContentValue(html);
  setHeadings(extractHeadings(html));
}, [getJoditInstance]);

  // ── Smart metadata fill ────────────────────────────────────────
  const applySmartFill = useCallback((html) => {
    const extracted = smartExtract(html);
    const cur = form.getFieldsValue();
    const updates = {};
    if (!cur.subHeading && extracted.excerpt) updates.subHeading = extracted.excerpt;
    if ((!cur.category || cur.category === 'Other') && extracted.detectedCategory !== 'Other') {
      updates.category = extracted.detectedCategory;
      notification.success({ message: '🏷️ Category Detected', description: `Set to: ${extracted.detectedCategory}`, duration: 3, placement: 'topRight' });
    }
    if ((!cur.tags || cur.tags.length === 0) && extracted.detectedTags.length > 0) {
      updates.tags = extracted.detectedTags;
      notification.success({ message: '🔖 Tags Detected', description: extracted.detectedTags.join(', '), duration: 3, placement: 'topRight' });
    }
    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
      setSmartFillApplied(true);
      setTimeout(() => setSmartFillApplied(false), 5000);
    }
  }, [form]);

  const handlePaste = useCallback(async (event) => {
    const cd = event.clipboardData;
    if (!cd) return;
    const pastedHtml = cd.getData('text/html');
    const pastedText = cd.getData('text/plain');
    if (!pastedHtml) return;  // no HTML → let Jodit handle plain text natively

    const isWordDoc = pastedHtml.includes('urn:schemas-microsoft-com') || pastedHtml.includes('mso-');
    const isGoogleDoc = pastedHtml.includes('google-docs') || pastedHtml.includes('docs.google');
    const isExternalHeavy = pastedHtml.includes('xmlns:') || pastedHtml.length > (pastedText.length || 1) * 4;

    if (!isWordDoc && !isGoogleDoc && !isExternalHeavy) return;

    event.preventDefault();
    event.stopPropagation();
    setPasteProcessing(true);
    try {
      let cleanHtml;
      if (isWordDoc || isGoogleDoc || isExternalHeavy) {
        cleanHtml = cleanExternalHtml(pastedHtml);
        notification.info({ message: '✨ Smart Paste Applied', description: 'Junk formatting stripped — bold, italic & lists preserved.', duration: 2, placement: 'topRight' });
      } else {
        cleanHtml = sanitiseRegularHtml(pastedHtml);
      }
      if (cleanHtml) { insertHtmlIntoEditor(cleanHtml); applySmartFill(cleanHtml); }
    } catch (e) {
      console.error('[paste error]', e);
      message.error('Failed to process pasted content');
    } finally {
      setPasteProcessing(false);
    }
  }, [insertHtmlIntoEditor, applySmartFill]);

  // ── FILE IMPORT ─────────────────────────────────────────────────
  const handleImportFile = useCallback(async (file) => {
    if (!file) return;
    setFileImporting(true);
    const SUPPORTED = ['docx','pdf','txt','html','htm','md','markdown','rtf'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED.includes(ext)) {
      message.error(`Unsupported format: .${ext}`);
      setFileImporting(false);
      return;
    }
    try {
      const html = await convertFileToHtml(file);
      if (!html || !html.trim()) { message.warning(`No readable content found in ${file.name}`); return; }
      const currentContent = contentRef.current;
      const hasContent = currentContent && currentContent !== '<p><br></p>' && currentContent.trim().length > 10;
      if (hasContent) {
        Modal.confirm({
          title: <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700 }}>Import "{file.name}"</span>,
          content: <span style={{ color: '#475569' }}>The editor already has content. Do you want to replace it or append to it?</span>,
          okText: 'Replace', cancelText: 'Append',
          okButtonProps: { style: { background: '#6d28d9', borderColor: '#6d28d9', borderRadius: 8, fontWeight: 600 } },
          cancelButtonProps: { style: { borderRadius: 8, fontWeight: 600 } },
          centered: true,
          onOk:    () => { replaceEditorContent(html); applySmartFill(html); notification.success({ message: `📄 "${file.name}" Imported`, description: 'Content replaced.', placement: 'topRight', duration: 3 }); },
          onCancel:() => { insertHtmlIntoEditor(html); applySmartFill(html); notification.success({ message: `📄 "${file.name}" Imported`, description: 'Content appended.', placement: 'topRight', duration: 3 }); },
        });
      } else {
        replaceEditorContent(html);
        applySmartFill(html);
        notification.success({ message: `📄 "${file.name}" Imported`, description: `${ext.toUpperCase()} file loaded — formatting preserved.`, placement: 'topRight', duration: 4 });
      }
    } catch (e) {
      console.error('[file import error]', e);
      message.error(e.message || `Failed to import ${file.name}`);
    } finally {
      setFileImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [replaceEditorContent, insertHtmlIntoEditor, applySmartFill]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleImportFile(file);
  }, [handleImportFile]);

  // ── Editor change handler ───────────────────────────────────────
  const handleEditorChange = useCallback((value) => {
    contentRef.current = value;
    setContentValue(value);
  }, []);

  // ── Auto-extract headings + subheading ─────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (contentRef.current) {
        setHeadings(extractHeadings(contentRef.current));
        const subHeading = form.getFieldValue('subHeading');
        if (!subHeading && contentRef.current && contentRef.current !== '<p><br></p>') {
          const ex = extractExcerpt(contentRef.current, 160);
          if (ex) form.setFieldsValue({ subHeading: ex });
        }
      }
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentValue, form]);

  // ── Auto-save ──────────────────────────────────────────────────
  useEffect(() => {
    let t;
    if (autoSave && contentValue && modalVisible && !pasteProcessing && !fileImporting) {
      t = setTimeout(() => handleAutoSave(), 30000);
    }
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentValue, autoSave, modalVisible, pasteProcessing, fileImporting]);

  const handleAutoSave = async () => {
    if (!contentRef.current || !modalVisible || pasteProcessing || fileImporting) return;
    const values = form.getFieldsValue();
    if (!values.title) return;
    const key = `blog_draft_${editingId || 'new'}`;
    localStorage.setItem(key, JSON.stringify({
      ...values, content: contentRef.current, headings,
      featuredImage: featuredImageList, coverImage: coverImageList,
      authorImage: authorImageList, timestamp: new Date().toISOString(),
    }));
    setLastSaved(new Date());
  };

  const loadDraft = (currentEditingId) => {
    const key = `blog_draft_${currentEditingId || 'new'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      const draftTime = moment(draft.timestamp);
      if (moment().diff(draftTime, 'hours') > 24) { localStorage.removeItem(key); return; }
      Modal.confirm({
        title: <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: THEME.text }}>Draft Found</span>,
        content: <span style={{ color: '#475569' }}>Restore draft saved {draftTime.format('MMM DD [at] HH:mm')}?</span>,
        okButtonProps: { style: { background: THEME.primary, borderColor: THEME.primary, borderRadius: 8, fontWeight: 600 } },
        cancelButtonProps: { style: { borderRadius: 8, fontWeight: 500 } },
        onOk: () => {
          form.setFieldsValue({
            title: draft.title, subHeading: draft.subHeading,
            tags: draft.tags, category: draft.category,
            authorName: draft.authorName, authorDesignation: draft.authorDesignation,
          });
          const dc = draft.content || '';
          contentRef.current = dc;
          setContentValue(dc);
          setHeadings(draft.headings || []);
          // FIX: also push into jodit via ref if available
          const jodit = getJoditInstance();
          if (jodit && typeof jodit.value !== 'undefined') jodit.value = dc;
          if (draft.featuredImage?.length) setFeaturedImageList(draft.featuredImage);
          if (draft.coverImage?.length)    setCoverImageList(draft.coverImage);
          if (draft.authorImage?.length)   setAuthorImageList(draft.authorImage);
          message.success('Draft restored!');
        },
      });
    } catch (e) { console.error(e); }
  };

  // ── API: fetch list ─────────────────────────────────────────────
  const fetchBlogs = useCallback(async (page = 1, limit = 10, searchVal = '', category = '', status = '') => {
    setLoading(true);
    try {
      let url = `/blogs/get-all-blogs?page=${page}&limit=${limit}`;
      if (searchVal?.trim()) url += `&search=${encodeURIComponent(searchVal.trim())}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (status)   url += `&isPublished=${status === 'published'}`;
      const res = await apiService.get(url);
      if (res.success) {
        setBlogs(res.data || []);
        setPagination({ currentPage: res.pagination?.page || page, totalPages: res.pagination?.totalPages || 1, totalResults: res.pagination?.total || res.data?.length || 0, itemsPerPage: res.pagination?.limit || limit });
        setStats({ total: res.pagination?.total || 0, published: res.data?.filter(b => b.isPublished).length || 0, drafts: res.data?.filter(b => !b.isPublished).length || 0, views: res.data?.reduce((s, b) => s + (b.viewCount || 0), 0) || 0 });
      }
    } catch (e) { console.error(e); message.error('Failed to load blogs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBlogs(1, 10, '', '', ''); }, [fetchBlogs]);

  const handleSearch = (e) => {
    const val = e.target.value; setSearchText(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchBlogs(1, pagination.itemsPerPage, val, selectedCategory, selectedStatus), 500);
  };

  const handleFilterChange = (type, val) => {
    if (type === 'category') { setSelectedCategory(val); fetchBlogs(1, pagination.itemsPerPage, searchText, val, selectedStatus); }
    else { setSelectedStatus(val); fetchBlogs(1, pagination.itemsPerPage, searchText, selectedCategory, val); }
  };

  const handleClearFilters = () => {
    setSearchText(''); setSelectedCategory(''); setSelectedStatus('');
    fetchBlogs(1, pagination.itemsPerPage, '', '', '');
  };

  // ── FIX #7: fetchBlogById — proper state hydration + editor remount
  const fetchBlogById = async (id) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/blogs/get-blog-by-id?id=${id}`);
      if (res.success && res.data) {
        const b = res.data;

        // 1. Reset form first
        form.resetFields();

        // 2. Set form fields
        form.setFieldsValue({
          title:             b.title             || '',
          subHeading:        b.subHeading        || '',
          tags:              b.tags              || [],
          category:          b.category          || 'Other',
          authorName:        b.authorName        || 'Admin',
          authorDesignation: b.authorDesignation || 'Content Writer',
        });

        // 3. Set content refs BEFORE opening modal
        const blogContent = b.content || '';
        contentRef.current = blogContent;
        setContentValue(blogContent);
        setHeadings(extractHeadings(blogContent));

        // 4. Set images
        setFeaturedImageList(b.featuredImage ? [{ uid: '-1', name: 'featured', status: 'done', url: b.featuredImage, preview: b.featuredImage }] : []);
        setCoverImageList(b.coverImage     ? [{ uid: '-2', name: 'cover',    status: 'done', url: b.coverImage,    preview: b.coverImage    }] : []);
        setAuthorImageList(b.authorImage   ? [{ uid: '-3', name: 'author',   status: 'done', url: b.authorImage,   preview: b.authorImage   }] : []);

        // 5. Set editing ID
        setEditingId(id);

        // 6. FIX #3: Increment editorKey so JoditEditor remounts with fresh content
        setEditorKey(k => k + 1);

        // 7. Open modal
        setModalVisible(true);

        // 8. Check for drafts after modal opens
        setTimeout(() => loadDraft(id), 300);
      } else {
        message.error(res.message || 'Failed to fetch blog');
      }
    } catch (e) {
      console.error(e);
      message.error('Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  };

  // ── API: upload file ────────────────────────────────────────────
  const uploadFile = async (file) => {
    const fd = new FormData(); fd.append('file', file);
    const res = await apiService.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (res.success) return res.url || res.file?.url;
    throw new Error(res.message || 'Upload failed');
  };

  const processImage = async (imageList) => {
    if (!imageList || imageList.length === 0) return '';
    if (imageList[0].originFileObj) return await uploadFile(imageList[0].originFileObj);
    if (imageList[0].url && !imageList[0].url.startsWith('blob:')) return imageList[0].url;
    return '';
  };

  // ── FIX #1: handleSave reads targetStatusRef (not async state)
  const handleSave = async (values) => {
    const currentContent = contentRef.current;
    const isPublishing = targetStatusRef.current === 'published';

    if (!currentContent || currentContent === '<p><br></p>') {
      message.error('Please add blog content');
      return;
    }
    if (isPublishing) {
      if (!featuredImageList.length) { message.error('Featured Image required for publishing'); return; }
      if (!coverImageList.length)    { message.error('Cover Image required for publishing');    return; }
      if (!authorImageList.length)   { message.error('Author Image required for publishing');   return; }
      if (!values.authorName)        { message.error('Author Name required for publishing');    return; }
    }

    setSaving(true);
    setSavingAs(targetStatusRef.current);
    try {
      const [featuredUrl, coverUrl, authorImgUrl] = await Promise.all([
        processImage(featuredImageList),
        processImage(coverImageList),
        processImage(authorImageList),
      ]);
      const cleanedContent = DOMPurify.sanitize(currentContent, {
        ALLOWED_TAGS: ['p','br','strong','b','em','i','u','s','strike','del','h1','h2','h3','h4','h5','h6','ul','ol','li','a','img','blockquote','pre','code','hr','table','thead','tbody','tr','td','th'],
        ALLOWED_ATTR: ['href','src','alt','title','target','rel','style'],
        ALLOW_DATA_ATTR: false,
      });
      const payload = {
        title:             values.title,
        subHeading:        values.subHeading || extractExcerpt(cleanedContent, 160),
        content:           cleanedContent,
        authorName:        values.authorName        || 'Admin',
        authorDesignation: values.authorDesignation || 'Content Writer',
        authorImage:       authorImgUrl,
        isPublished:       isPublishing,
        tags:              values.tags     || [],
        category:          values.category || 'Other',
        featuredImage:     featuredUrl,
        coverImage:        coverUrl,
      };
      if (isPublishing) payload.publishedAt = new Date().toISOString();

      const res = editingId
        ? await apiService.put(`/blogs/edit-blog-by-id?id=${editingId}`, payload)
        : await apiService.post('/blogs/create-blog', payload);

      if (res.success) {
        notification.success({
          message: <span style={{ fontWeight: 700 }}>{editingId ? 'Blog Updated' : 'Blog Created'}</span>,
          description: <span style={{ color: '#475569' }}>"{values.title}" {isPublishing ? 'published' : 'saved as draft'} successfully</span>,
          placement: 'topRight', duration: 4,
        });
        localStorage.removeItem(`blog_draft_${editingId || 'new'}`);
        closeModal();
        fetchBlogs(pagination.currentPage, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus);
      } else {
        message.error(res.message || 'Operation failed');
      }
    } catch (e) {
      console.error(e);
      message.error(e.message || 'Failed to save blog');
    } finally {
      setSaving(false);
      setSavingAs('');
    }
  };

  // ── Delete ──────────────────────────────────────────────────────
  const deleteBlog = async (id) => {
    try {
      const res = await apiService.delete(`/blogs/delete-blog-by-id?id=${id}`);
      if (res.success) { message.success('Blog deleted'); fetchBlogs(pagination.currentPage, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus); }
      else message.error(res.message || 'Delete failed');
    } catch (e) { console.error(e); message.error('Failed to delete'); }
  };

  // ── Preview ─────────────────────────────────────────────────────
  const handleCardPreview = async (record) => {
    const hide = message.loading('Loading preview…', 0);
    try {
      const res = await apiService.get(`/blogs/get-blog-by-id?id=${record._id}`);
      showPreview(res.success && res.data ? res.data : record, false);
    } catch { showPreview(record, false); }
    finally { hide(); }
  };

  const showPreview = (blogData = {}, isLive = false) => {
    if (isLive) {
      const fv = form.getFieldsValue();
      setPreviewBlogData({
        title:             fv.title || 'Untitled',
        subHeading:        fv.subHeading,
        content:           contentRef.current,
        authorName:        fv.authorName,
        authorDesignation: fv.authorDesignation,
        tags:              fv.tags,
        category:          fv.category,
        featuredImage:     featuredImageList[0]?.url || featuredImageList[0]?.preview,
        coverImage:        coverImageList[0]?.url    || coverImageList[0]?.preview,
        authorImage:       authorImageList[0]?.url   || authorImageList[0]?.preview,
        headings,
        createdAt:         new Date(),
        readingTime:       Math.max(1, Math.ceil((contentRef.current || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200)),
      });
    } else {
      setPreviewBlogData({
        ...blogData,
        headings:    extractHeadings(blogData?.content || ''),
        readingTime: Math.max(1, Math.ceil((blogData?.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200)),
      });
    }
    setPreviewModalVisible(true);
  };

  // ── FIX #8: closeModal clears ALL state cleanly
  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setFeaturedImageList([]);
    setCoverImageList([]);
    setAuthorImageList([]);
    contentRef.current = '';
    setContentValue('');
    setHeadings([]);
    setSmartFillApplied(false);
    setLastSaved(null);
    form.resetFields();
  };

  // ── openCreate: reset everything, bump editorKey for clean mount
  const openCreate = () => {
    form.resetFields();
    setEditingId(null);
    setFeaturedImageList([]);
    setCoverImageList([]);
    setAuthorImageList([]);
    contentRef.current = '';
    setContentValue('');
    setHeadings([]);
    setSmartFillApplied(false);
    setEditorKey(k => k + 1);   // FIX #3: fresh editor
    setModalVisible(true);
    setTimeout(() => loadDraft(null), 300);
  };

  // ── Stat cards ─────────────────────────────────────────────────
  const statCards = [
    { label: 'Total Posts', value: stats.total,     icon: <FileTextOutlined />,    color: 'purple' },
    { label: 'Published',   value: stats.published,  icon: <CheckCircleOutlined />, color: 'green'  },
    { label: 'Drafts',      value: stats.drafts,     icon: <SyncOutlined />,        color: 'amber'  },
    { label: 'Total Views', value: stats.views,      icon: <EyeOutlined />,         color: 'blue'   },
  ];

  const PAGE_RANGE = Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, pagination.currentPage - 3), pagination.currentPage + 2);

  // ══════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* Hidden file input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.txt,.html,.htm,.md,.markdown,.rtf"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      <div className="bm-root">
        {/* ── Header ── */}
        <div className="bm-header">
          <div>
            <h1 className="bm-header-title">
              <AppstoreAddOutlined style={{ color: THEME.primary }} />
              Blog Management
            </h1>
            <p className="bm-header-sub">Create, manage & publish — smart paste + file import from Word, PDF, Google Docs</p>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreate} className="bm-btn-primary">
            Create New Post
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="bm-stats">
          {statCards.map(s => (
            <div key={s.label} className="bm-stat-card">
              <div className="bm-stat-top">
                <div className="bm-stat-label">{s.label}</div>
                <div className={`bm-stat-icon ${s.color}`}>{s.icon}</div>
              </div>
              <div className="bm-stat-value">{s.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bm-filters">
          <Input size="large" prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="Search posts by title or tag…"
            value={searchText} onChange={handleSearch} allowClear style={{ flex: 1, minWidth: 200 }} />
          <Select size="large" placeholder="Category" value={selectedCategory || undefined} onChange={v => handleFilterChange('category', v)} allowClear style={{ flex: '1 1 150px', minWidth: 150 }}>
            {[['AI','🤖 AI'],['Real Estate','🏠 Real Estate'],['PropTech','📱 PropTech'],['Technology','💻 Technology'],['Business','💼 Business'],['Mortgage','🏦 Mortgage'],['Landscaping','🌳 Landscaping'],['Other','📄 Other']].map(([v, l]) => <Option key={v} value={v}>{l}</Option>)}
          </Select>
          <Select size="large" placeholder="Status" value={selectedStatus || undefined} onChange={v => handleFilterChange('status', v)} allowClear style={{ flex: '1 1 130px', minWidth: 130 }}>
            <Option value="published">✅ Published</Option>
            <Option value="draft">📝 Draft</Option>
          </Select>
          <Button size="large" icon={<UndoOutlined />} onClick={handleClearFilters} style={{ borderRadius: 10, borderColor: '#e2e8f0', color: '#64748b', flex: '1 1 auto', minWidth: 100, fontWeight: 600 }}>Clear</Button>
        </div>

        {/* ── Blog List ── */}
        {loading ? (
          <div>
            {[1, 2, 3].map(i => (
              <Card key={i} style={{ borderRadius: 16, marginBottom: 20, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 24 }}>
                <Skeleton active avatar={{ size: 80, shape: 'square' }} paragraph={{ rows: 3 }} />
              </Card>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="bm-empty">
            <div className="bm-empty-icon"><FileTextOutlined /></div>
            <div className="bm-empty-title">No posts found</div>
            <div className="bm-empty-sub">Create your first blog post or clear the filters</div>
          </div>
        ) : (
          <>
            {blogs.map(record => (
              <div key={record._id} className="bm-blog-card">
                <div className="bm-blog-thumb">
                  {record.featuredImage
                    ? <img src={record.featuredImage} alt={record.title} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 42, color: '#cbd5e1' }}><FileTextOutlined /></div>}
                </div>
                <div className="bm-blog-body">
                  <div>
                    <div className="bm-blog-top">
                      <div className="bm-blog-badges">
                        <span className="bm-cat-tag">{record.category || 'Uncategorized'}</span>
                        <span className={`bm-status-badge ${record.isPublished ? 'published' : 'draft'}`}>
                          {record.isPublished ? <><CheckCircleOutlined /> Published</> : <><SyncOutlined /> Draft</>}
                        </span>
                      </div>
                      <div className="bm-blog-actions">
                        <Tooltip title="Edit">
                          <button className="bm-action-btn" onClick={() => fetchBlogById(record._id)}><EditOutlined /></button>
                        </Tooltip>
                        <Tooltip title="Preview">
                          <button className="bm-action-btn" onClick={() => handleCardPreview(record)}><EyeOutlined /></button>
                        </Tooltip>
                        <Popconfirm
                          title={<span style={{ fontWeight: 700 }}>Delete Post</span>}
                          description="This action cannot be undone."
                          onConfirm={() => deleteBlog(record._id)}
                          okText="Delete"
                          okButtonProps={{ danger: true, style: { fontWeight: 600, borderRadius: 8 } }}
                          cancelButtonProps={{ style: { borderRadius: 8, fontWeight: 500 } }}>
                          <Tooltip title="Delete">
                            <button className="bm-action-btn danger"><DeleteOutlined /></button>
                          </Tooltip>
                        </Popconfirm>
                      </div>
                    </div>
                    <div className="bm-blog-title">{record.title || 'Untitled Post'}</div>
                    <div className="bm-blog-excerpt">{record.subHeading || 'No excerpt available…'}</div>
                    <div className="bm-blog-tags">
                      {record.tags?.slice(0, 5).map(tag => <span key={tag} className="bm-tag">#{tag}</span>)}
                      {record.tags?.length > 5 && <span className="bm-tag">+{record.tags.length - 5}</span>}
                    </div>
                  </div>
                  <div className="bm-blog-footer">
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div className="bm-meta-item"><Avatar size={24} src={record.authorImage} icon={<UserOutlined />} style={{ background: '#e2e8f0', color: '#64748b' }} /><strong>{record.authorName || 'Admin'}</strong></div>
                      <div className="bm-meta-item"><CalendarOutlined />{moment(record.createdAt).format('MMM DD, YYYY')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div className="bm-meta-item"><ClockCircleOutlined />{record.readingTime || 2} min read</div>
                      <div className="bm-meta-item"><EyeOutlined />{(record.viewCount || 0).toLocaleString()} views</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="bm-pagination">
              <div className="bm-page-info">
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalResults)} of {pagination.totalResults} posts
              </div>
              <div className="bm-page-btns">
                <button className="bm-page-btn" disabled={pagination.currentPage === 1}
                  onClick={() => fetchBlogs(pagination.currentPage - 1, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus)}>
                  <ArrowLeftOutlined />
                </button>
                {PAGE_RANGE.map(p => (
                  <button key={p} className={`bm-page-btn ${pagination.currentPage === p ? 'active' : ''}`}
                    onClick={() => fetchBlogs(p, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus)}>
                    {p}
                  </button>
                ))}
                <button className="bm-page-btn" disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => fetchBlogs(pagination.currentPage + 1, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus)}>
                  <ArrowRightOutlined />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
           CREATE / EDIT MODAL
         ══════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span>{editingId ? <><EditOutlined style={{ marginRight: 8 }} />Edit Post</> : <><RocketOutlined style={{ marginRight: 8 }} />Create New Post</>}</span>
            {lastSaved && autoSave && (
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginRight: 32 }}>
                <CheckCircleOutlined style={{ color: '#10b981', marginRight: 4 }} />
                Saved {moment(lastSaved).format('HH:mm:ss')}
              </span>
            )}
          </div>
        }
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        className="bm-modal"
        width={screens.xs ? '98%' : 1060}
        styles={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ category: 'Other', authorName: 'Admin', authorDesignation: 'Content Writer' }}
        >
          <Tabs
  defaultActiveKey="content"
  size="large"
  tabBarStyle={{ fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
  
  items={[
    {
      key: 'content',
      label: <span><EditOutlined /> Content</span>,
      children: (
        <>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label={<span style={{ fontWeight: 600, fontSize: 14, color: THEME.text }}>Post Title</span>}
                rules={[{ required: true, message: 'Title is required' }]}
              >
                <Input
                  placeholder="Enter an engaging, SEO-friendly title…"
                  size="large"
                  style={{ borderRadius: 8, fontSize: 15, fontWeight: 500, padding: '10px 14px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="subHeading"
            label={<span style={{ fontWeight: 600, fontSize: 14, color: THEME.text }}>Subheading / Excerpt</span>}
          >
            <TextArea
              rows={2}
              placeholder="Auto-extracted from content, or write your own (max 160 chars)"
              maxLength={160}
              showCount
              style={{ borderRadius: 8, fontWeight: 500, fontSize: 14, padding: '10px 14px' }}
            />
          </Form.Item>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="tags"
                label={<span style={{ fontWeight: 600, fontSize: 14, color: THEME.text }}>Tags</span>}
              >
                <Select
                  mode="tags"
                  size="large"
                  placeholder="Add tags (press Enter)"
                  tokenSeparators={[',']}
                  style={{ borderRadius: 8, fontWeight: 500 }}
                >
                  {['AI','Real Estate','PropTech','Technology','Business','Mortgage','Landscaping','Marketing','UAE','Dubai','Innovation'].map(t => (
                    <Option key={t} value={t}>{t}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label={<span style={{ fontWeight: 600, fontSize: 14, color: THEME.text }}>Category</span>}
              >
                <Select size="large" placeholder="Select category" style={{ fontWeight: 500 }}>
                  {[
                    ['AI','🤖'], ['Real Estate','🏠'], ['PropTech','📱'],
                    ['Technology','💻'], ['Business','💼'], ['Mortgage','🏦'],
                    ['Landscaping','🌳'], ['Other','📄']
                  ].map(([v, e]) => (
                    <Option key={v} value={v}>{e} {v}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* CONTENT EDITOR SECTION */}
          <Form.Item
            label={
              <span style={{ fontWeight: 600, fontSize: 14, color: THEME.text }}>
                Blog Content <span style={{ color: '#ef4444' }}>*</span>
              </span>
            }
          >
            {/* Import Zone */}
            <div className="bm-import-zone">
              <div className="bm-import-zone-top">
                <div className="bm-import-zone-left">
                  <div className="bm-import-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div>
                    <p className="bm-import-zone-title">Import file</p>
                    <p className="bm-import-zone-sub">Bold, italic, lists and headings are preserved</p>
                  </div>
                </div>
                <button
                  className="bm-import-btn"
                  disabled={fileImporting}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  {fileImporting ? (
                    <LoadingOutlined style={{ fontSize: 13 }} spin />
                  ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  )}
                  {fileImporting ? 'Importing…' : 'Choose file'}
                </button>
              </div>
              <div className="bm-formats-row">
                <span className="bm-formats-label">Supported</span>
                <span className="bm-format-badge docx">DOCX</span>
                <span className="bm-format-badge pdf">PDF</span>
                <span className="bm-format-badge md">MD</span>
                <span className="bm-format-badge html">HTML</span>
                <span className="bm-format-badge txt">TXT</span>
                <span className="bm-format-badge rtf">RTF</span>
              </div>
              <div className="bm-import-paste-hint">
                <div className="bm-import-paste-dot" />
                Smart paste active — copy from Word or Google Docs and paste directly into the editor below
              </div>
            </div>

            {/* Alerts */}
            {smartFillApplied && (
              <Alert
                message={<span style={{ fontWeight: 600 }}>✨ Smart Fill Applied — Category & tags auto-detected!</span>}
                type="success"
                showIcon
                closable
                onClose={() => setSmartFillApplied(false)}
                style={{ marginBottom: 12, borderRadius: 8 }}
              />
            )}
            {pasteProcessing && (
              <Alert
                message={<span style={{ fontWeight: 600 }}>⏳ Processing paste — preserving formatting…</span>}
                type="info"
                showIcon
                style={{ marginBottom: 12, borderRadius: 8 }}
              />
            )}
            {fileImporting && (
              <Alert
                message={<span style={{ fontWeight: 600 }}>📄 Importing file — extracting formatted content…</span>}
                type="info"
                showIcon
                icon={<Spin indicator={<LoadingOutlined />} />}
                style={{ marginBottom: 12, borderRadius: 8 }}
              />
            )}

            {/* Editor wrapper with paste handler */}
            <div
              onPasteCapture={handlePaste}
              style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}
            >
            <JoditEditor
  key={editorKey}
  ref={editorRef}
  value={contentRef.current}
  config={editorConfig}
  onChange={(newContent) => {
    contentRef.current = newContent;
    clearTimeout(contentDebounceRef.current);
    contentDebounceRef.current = setTimeout(() => {
      setHeadings(extractHeadings(newContent));
    }, 800);
  }}
/>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 10 }}>
              <Button
                icon={<EyeOutlined />}
                onClick={() => showPreview({}, true)}
                disabled={!contentRef.current || contentRef.current === '<p><br></p>'}
                style={{ borderRadius: 8, borderColor: '#e2e8f0', color: '#4c1d95', fontWeight: 600, height: 40, padding: '0 20px', background: '#f8fafc' }}
              >
                Live Preview
              </Button>
            </div>
          </Form.Item>
        </>
      )
    },
    {
      key: 'media',
      label: <span><PictureOutlined /> Media</span>,
      children: (
        <>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginBottom: 24, borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700 }}>📸 Image Guidelines</div>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 4, fontWeight: 500 }}>
              Featured image shows in blog listings; Cover image is the full-width hero banner.
            </div>
          </div>
          <Row gutter={[32, 24]}>
            <Col xs={24} md={12}>
              <UploadWithCrop
                fileList={featuredImageList}
                onChange={setFeaturedImageList}
                aspect={3/2}
                cropTitle="Crop Featured Image (3:2)"
                maxSizeMB={5}
                label="Featured Image (Card Thumbnail)"
                extra="Recommended: 1200 × 800px · Max 5MB"
              />
            </Col>
            <Col xs={24} md={12}>
              <UploadWithCrop
                fileList={coverImageList}
                onChange={setCoverImageList}
                aspect={16/9}
                cropTitle="Crop Cover / Hero Image (16:9)"
                maxSizeMB={5}
                label="Cover Image (Hero Banner)"
                extra="Recommended: 1920 × 1080px · Max 5MB"
              />
            </Col>
          </Row>
        </>
      )
    },
    {
      key: 'author',
      label: <span><UserOutlined /> Author</span>,
      children: (
        <>
          <Row gutter={32} align="top">
            <Col xs={24} md={14}>
              <Form.Item
                name="authorName"
                label={<span style={{ fontWeight: 600, fontSize: 14, color: THEME.text }}>Author Name</span>}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Author's full name"
                  size="large"
                  style={{ borderRadius: 8, fontWeight: 500 }}
                />
              </Form.Item>
              <Form.Item
                name="authorDesignation"
                label={<span style={{ fontWeight: 600, fontSize: 14, color: THEME.text }}>Author Designation</span>}
              >
                <Input
                  prefix={<TagOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="e.g. Content Writer, Senior Editor, Guest Author"
                  size="large"
                  style={{ borderRadius: 8, fontWeight: 500 }}
                />
              </Form.Item>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginTop: 24, borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700 }}>ℹ️ Author Info</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4, fontWeight: 500 }}>
                  Optional for drafts, required for publishing.
                </div>
              </div>
            </Col>
            <Col xs={24} md={10}>
              <UploadWithCrop
                fileList={authorImageList}
                onChange={setAuthorImageList}
                aspect={1}
                cropTitle="Crop Author Avatar (1:1)"
                maxSizeMB={2}
                label="Author Avatar"
                extra="Recommended: 400 × 400px · Max 2MB"
              />
            </Col>
          </Row>
        </>
      )
    }
  ]}
/>

          {/* Footer Actions */}
          <div className="bm-footer-bar">
            <Space>
              <Switch checked={autoSave} onChange={setAutoSave} style={{ background: autoSave ? '#0f172a' : undefined }} />
              <Text style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>Auto-save</Text>
            </Space>
            <Space size={12} style={{ flexWrap: 'wrap' }}>
              {/* FIX #1 & #6: set targetStatusRef synchronously, then submit */}
              <Button
                size="large"
                icon={<SaveOutlined />}
                onClick={() => { targetStatusRef.current = 'draft'; form.submit(); }}
                // FIX #6: use savingAs for button loading state (no async race)
                loading={saving && savingAs === 'draft'}
                className="bm-save-draft-btn">
                Save Draft
              </Button>
              <Button
                type="primary"
                size="large"
                icon={editingId ? <CheckCircleOutlined /> : <RocketOutlined />}
                onClick={() => { targetStatusRef.current = 'published'; form.submit(); }}
                loading={saving && savingAs === 'published'}
                className="bm-publish-btn">
                {editingId ? 'Update & Publish' : 'Publish Post'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* ── PREVIEW MODAL ── */}
      <Modal
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: screens.xs ? 'none' : 'block' }}>
              This is how your blog will appear to readers
            </Text>
            <Button onClick={() => setPreviewModalVisible(false)}
              style={{ borderRadius: 8, fontWeight: 600, width: screens.xs ? '100%' : 'auto', height: 40 }}>
              Close Preview
            </Button>
          </div>
        }
        width={screens.xs ? '98%' : 900}
        styles={{ maxHeight: '80vh', overflowY: 'auto', padding: 0 }}
        centered
        className="preview-modal"
        zIndex={1100}
        title={<span style={{ color: '#0f172a' }}><EyeOutlined style={{ marginRight: 8 }} />Blog Preview</span>}
      >
        <BlogPreview data={previewBlogData} />
      </Modal>
    </>
  );
};

export default BlogManagement;   