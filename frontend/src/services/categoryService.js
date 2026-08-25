import { getBackendUrl, getAdminBackendUrl } from './apiSetup';

export const BASE_TAXONOMY = {
  "Services": {},
  "Products": {},
  "Daily Needs": {},
  "Food": {},
  "Stay": {},
  "Travel": {},
  "Jobs": {}
};

export const normalizeCategoryName = (rawName) => {
  if (!rawName) return '';
  const n = rawName.trim().toLowerCase();
  if (n === 'products' || n === 'product') return 'Products';
  if (n === 'stay') return 'Stay';
  if (n === 'food') return 'Food';
  if (n === 'daily need' || n === 'daily needs') return 'Daily Needs';
  if (n === 'job' || n === 'jobs') return 'Jobs';
  if (n === 'service' || n === 'services') return 'Services';
  if (n === 'travel') return 'Travel';
  return rawName.trim();
};

/**
 * Builds the active category tree STRICTLY based on Admin Category Management API records (dbCategories).
 * Removes hardcoded category memory override when admin deletes or deactivates categories/subcategories.
 */
const resolveMainCategoryName = (c) => {
  if (!c) return '';
  if (c.mainCategory) return normalizeCategoryName(c.mainCategory);
  if (c.main_category) return normalizeCategoryName(c.main_category);

  const normName = c.name ? normalizeCategoryName(c.name) : '';
  const canonicalMains = ['Services', 'Products', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Jobs'];

  if (canonicalMains.includes(normName) || c.level === 'main' || c.isMainCategory === true) {
    return normName;
  }

  if (c.parentName) {
    const normParent = normalizeCategoryName(c.parentName);
    if (canonicalMains.includes(normParent)) return normParent;
  }

  return normName;
};

export const buildActiveCategoryTree = (dbCategories = []) => {
  const catTree = {};

  // 1. Initialize empty taxonomy structure for canonical main categories
  const canonicalMains = ['Services', 'Products', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Jobs'];
  canonicalMains.forEach(mainName => {
    catTree[mainName] = {
      name: mainName,
      isActive: true,
      subcategories: {}
    };
  });

  if (!Array.isArray(dbCategories) || dbCategories.length === 0) {
    return catTree;
  }

  // Helper to safely append a subcategory & children to catTree
  const appendSub = (mainNameRaw, subNameRaw, childItems = []) => {
    if (!mainNameRaw || !subNameRaw) return;
    const mainName = normalizeCategoryName(mainNameRaw);
    const subName = subNameRaw.trim();
    if (!subName || subName === 'ALL_SUBCATEGORIES_DELETED_MARKER') return;
    if (normalizeCategoryName(subName) === mainName) return;

    if (!catTree[mainName]) {
      catTree[mainName] = { name: mainName, isActive: true, subcategories: {} };
    }

    if (!catTree[mainName].subcategories[subName]) {
      catTree[mainName].subcategories[subName] = {
        name: subName,
        isActive: true,
        childCategories: []
      };
    }

    if (Array.isArray(childItems)) {
      childItems.forEach(ch => {
        if (!ch) return;
        const chName = (typeof ch === 'string' ? ch : ch.name || ch.subSubcategory || '').trim();
        if (chName && normalizeCategoryName(chName) !== mainName && !catTree[mainName].subcategories[subName].childCategories.includes(chName)) {
          catTree[mainName].subcategories[subName].childCategories.push(chName);
        }
      });
    }
  };

  // 1. Process Root Main Category Nodes & their .children arrays
  const rootMains = dbCategories.filter(c => c && (c.isActive !== false) && !c.isDeleted && (!c.parentId || c.level === 'main' || c.level === 1 || c.isMainCategory === true));
  const rootMainIds = new Map();

  rootMains.forEach(root => {
    const mainName = normalizeCategoryName(root.name || root.mainCategory);
    if (!mainName) return;
    if (root._id) rootMainIds.set(root._id.toString(), mainName);

    if (Array.isArray(root.children)) {
      root.children.forEach(subNode => {
        if (!subNode || subNode.isActive === false || subNode.isDeleted || subNode.description === 'DELETED_HIERARCHY_MARKER') return;
        const subName = (subNode.name || subNode.subcategory || '').trim();
        appendSub(mainName, subName, subNode.children);
      });
    }
  });

  // 2. Process Nodes with parentId pointing to Root Main Category Node IDs
  if (rootMainIds.size > 0) {
    dbCategories.forEach(c => {
      if (!c || c.isActive === false || c.isDeleted || c.description === 'DELETED_HIERARCHY_MARKER') return;
      if (c.parentId && rootMainIds.has(c.parentId.toString())) {
        const mainName = rootMainIds.get(c.parentId.toString());
        const subName = (c.name || c.subcategory || '').trim();
        const childrenOfSub = c._id ? dbCategories.filter(ch => ch && ch.parentId && ch.parentId.toString() === c._id.toString()) : [];
        appendSub(mainName, subName, [...(c.children || []), ...childrenOfSub]);
      }
    });
  }

  // 3. Process Flat DB Records with explicit mainCategory or parentName
  dbCategories.forEach(c => {
    if (!c || c.isActive === false || c.isDeleted || c.description === 'DELETED_HIERARCHY_MARKER') return;
    if (c.level === 'main' && (!c.subcategory || normalizeCategoryName(c.subcategory) === normalizeCategoryName(c.name))) return;

    const mainName = resolveMainCategoryName(c);
    if (!mainName) return;

    let subName = (c.subcategory || c.name || '').trim();
    if (!subName) return;

    const childName = (c.subSubcategory || '').trim();
    appendSub(mainName, subName, childName ? [childName] : (c.children || []));
  });

  return catTree;
};

export const getDynamicMenuData = (dbCategories = []) => {
  const catTree = buildActiveCategoryTree(dbCategories);
  const menuData = {};

  Object.keys(catTree).forEach(mainName => {
    menuData[mainName] = {};
    const subs = catTree[mainName].subcategories || {};
    Object.keys(subs).forEach(subName => {
      menuData[mainName][subName] = {
        items: (subs[subName].childCategories || []).map(ch => typeof ch === 'string' ? ch : ch.name)
      };
    });
  });

  return menuData;
};

export const getActiveMainCategories = (dbCategories = []) => {
  const catTree = buildActiveCategoryTree(dbCategories);
  const activeKeys = Object.keys(catTree).filter(k => catTree[k] && catTree[k].isActive !== false);

  const canonicalMains = ['Services', 'Products', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Jobs'];
  
  const sorted = [];
  canonicalMains.forEach(m => {
    if (activeKeys.includes(m)) sorted.push(m);
  });
  
  // Include any custom Level 1 main categories explicitly created by Admin
  activeKeys.forEach(k => {
    if (!sorted.includes(k) && k) {
      const isExplicitMain = Array.isArray(dbCategories) && dbCategories.some(c => 
        c && (c.level === 'main' || c.isMainCategory === true) && normalizeCategoryName(c.name) === k
      );
      if (isExplicitMain) sorted.push(k);
    }
  });

  return sorted.length > 0 ? sorted : canonicalMains;
};

export const fetchAdminCategories = async () => {
  const urlsToTry = [
    '/api/public/categories',
    '/api/admin/categories',
    '/api/categories',
    `${getBackendUrl()}/api/public/categories`,
    `${getBackendUrl()}/api/admin/categories`,
    `${getAdminBackendUrl()}/api/admin/categories`
  ];

  const uniqueUrls = [...new Set(urlsToTry.filter(Boolean))];

  for (const url of uniqueUrls) {
    try {
      const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {}
  }

  return [];
};
