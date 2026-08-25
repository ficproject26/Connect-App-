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

  // 2. Handle 3-Tier Hierarchical Array (if level === 'main' and .children is populated)
  const hierarchicalMains = dbCategories.filter(c => c && c.level === 'main' && Array.isArray(c.children) && c.children.length > 0);
  hierarchicalMains.forEach(mainCat => {
    const mainName = normalizeCategoryName(mainCat.name);
    if (mainCat.isActive === false || mainCat.isDeleted) {
      delete catTree[mainName];
      return;
    }

    if (!catTree[mainName]) {
      catTree[mainName] = { name: mainName, isActive: true, subcategories: {} };
    }

    if (Array.isArray(mainCat.children)) {
      mainCat.children.forEach(subCat => {
        if (!subCat || !subCat.name) return;
        const subName = subCat.name.trim();
        if (subCat.isActive === false || subCat.isDeleted || subCat.description === 'DELETED_HIERARCHY_MARKER') return;
        if (normalizeCategoryName(subName) === normalizeCategoryName(mainName)) return;

        const childItems = [];
        if (Array.isArray(subCat.children)) {
          subCat.children.forEach(childCat => {
            if (!childCat || !childCat.name) return;
            if (childCat.isActive === false || childCat.isDeleted || childCat.description === 'DELETED_HIERARCHY_MARKER') return;
            if (normalizeCategoryName(childCat.name) !== normalizeCategoryName(mainName)) {
              childItems.push(childCat.name.trim());
            }
          });
        }

        catTree[mainName].subcategories[subName] = {
          name: subName,
          isActive: true,
          childCategories: childItems
        };
      });
    }
  });

  // 3. Process Flat DB Records & Custom Main/Sub/Child Categories
  dbCategories.forEach(c => {
    if (!c || c.level === 'main') return;
    const mainName = resolveMainCategoryName(c);
    if (!mainName) return;

    if (c.isActive === false || c.isDeleted || c.description === 'DELETED_HIERARCHY_MARKER') {
      if (c.subcategory && catTree[mainName]?.subcategories[c.subcategory.trim()]) {
        delete catTree[mainName].subcategories[c.subcategory.trim()];
      }
      return;
    }

    if (!catTree[mainName]) {
      catTree[mainName] = { name: mainName, isActive: true, subcategories: {} };
    }

    let subName = (c.subcategory || '').trim();
    if (!subName && c.name && c.mainCategory && normalizeCategoryName(c.mainCategory) !== normalizeCategoryName(c.name)) {
      subName = c.name.trim();
    }

    if (normalizeCategoryName(subName) === normalizeCategoryName(mainName)) return;

    if (subName && subName !== 'ALL_SUBCATEGORIES_DELETED_MARKER') {
      if (!catTree[mainName].subcategories[subName]) {
        catTree[mainName].subcategories[subName] = {
          name: subName,
          isActive: true,
          childCategories: []
        };
      }
      if (c.subSubcategory && c.subSubcategory.trim()) {
        const childName = c.subSubcategory.trim();
        if (normalizeCategoryName(childName) !== normalizeCategoryName(mainName) && !catTree[mainName].subcategories[subName].childCategories.includes(childName)) {
          catTree[mainName].subcategories[subName].childCategories.push(childName);
        }
      }
    }
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
