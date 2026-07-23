import { getAdminBackendUrl } from './apiSetup';

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
export const buildActiveCategoryTree = (dbCategories = []) => {
  const catTree = {};

  // 1. Initialize with BASE_TAXONOMY baseline
  Object.keys(BASE_TAXONOMY).forEach(mainName => {
    catTree[mainName] = {
      name: mainName,
      isActive: true,
      subcategories: {}
    };
    const subData = BASE_TAXONOMY[mainName];
    if (subData && typeof subData === 'object') {
      Object.keys(subData).forEach(subName => {
        catTree[mainName].subcategories[subName] = {
          name: subName,
          isActive: true,
          childCategories: [...(subData[subName] || [])]
        };
      });
    }
  });

  if (!Array.isArray(dbCategories) || dbCategories.length === 0) {
    return catTree;
  }

  // 2. Handle 3-Tier Hierarchical Array (ONLY if children array is populated)
  const hierarchicalMains = dbCategories.filter(c => c && c.level === 'main' && Array.isArray(c.children) && c.children.length > 0);
  if (hierarchicalMains.length > 0) {
    hierarchicalMains.forEach(mainCat => {
      const mainName = normalizeCategoryName(mainCat.name);
      if (mainCat.isActive === false || mainCat.isDeleted) {
        delete catTree[mainName];
        return;
      }

      catTree[mainName] = {
        name: mainName,
        isActive: true,
        subcategories: {}
      };

      if (Array.isArray(mainCat.children)) {
        mainCat.children.forEach(subCat => {
          if (!subCat || !subCat.name) return;
          const subName = subCat.name.trim();
          if (subCat.isActive === false || subCat.isDeleted || subCat.description === 'DELETED_HIERARCHY_MARKER') return;

          const childItems = [];
          if (Array.isArray(subCat.children)) {
            subCat.children.forEach(childCat => {
              if (!childCat || !childCat.name) return;
              if (childCat.isActive === false || childCat.isDeleted || childCat.description === 'DELETED_HIERARCHY_MARKER') return;
              childItems.push(childCat.name.trim());
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
  }

  // 3. Handle Flat DB Records
  const flatSubs = dbCategories.filter(c => c && c.subcategory);
  if (flatSubs.length > 0) {
    const flatByMain = {};
    dbCategories.forEach(c => {
      if (!c || !c.name) return;
      const mainName = normalizeCategoryName(c.name);
      if (!flatByMain[mainName]) flatByMain[mainName] = [];
      flatByMain[mainName].push(c);
    });

    Object.keys(flatByMain).forEach(mainName => {
      const records = flatByMain[mainName];
      const activeSubs = records.filter(c => 
        c.subcategory && 
        c.subcategory !== 'ALL_SUBCATEGORIES_DELETED_MARKER' && 
        c.isActive !== false && 
        !c.isDeleted && 
        c.description !== 'DELETED_HIERARCHY_MARKER'
      );
      const hasAllDeleted = records.some(c => 
        c.subcategory === 'ALL_SUBCATEGORIES_DELETED_MARKER' || c.description === 'DELETED_HIERARCHY_MARKER'
      );

      if (activeSubs.length > 0 || hasAllDeleted) {
        catTree[mainName] = {
          name: mainName,
          isActive: true,
          subcategories: {}
        };
        activeSubs.forEach(c => {
          const subName = c.subcategory.trim();
          if (!catTree[mainName].subcategories[subName]) {
            catTree[mainName].subcategories[subName] = {
              name: subName,
              isActive: true,
              childCategories: []
            };
          }
          if (c.subSubcategory && c.subSubcategory.trim()) {
            const childName = c.subSubcategory.trim();
            if (!catTree[mainName].subcategories[subName].childCategories.includes(childName)) {
              catTree[mainName].subcategories[subName].childCategories.push(childName);
            }
          }
        });
      }
    });
  }

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
  const canonicalMains = ['Services', 'Products', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Jobs'];

  // If hierarchical API response is passed
  if (Array.isArray(dbCategories) && dbCategories.length > 0 && dbCategories[0]?.level) {
    const activeMains = dbCategories
      .filter(c => c.level === 'main' && c.isActive !== false)
      .map(c => normalizeCategoryName(c.name));

    const sorted = [];
    canonicalMains.forEach(m => {
      if (activeMains.includes(m)) sorted.push(m);
    });
    activeMains.forEach(k => {
      if (!sorted.includes(k) && k) sorted.push(k);
    });
    return sorted.length > 0 ? sorted : canonicalMains;
  }

  const catTree = buildActiveCategoryTree(dbCategories);
  const activeKeys = Object.keys(catTree).filter(k => canonicalMains.includes(k));
  
  const sorted = [];
  canonicalMains.forEach(m => {
    if (activeKeys.includes(m)) sorted.push(m);
  });
  return sorted.length > 0 ? sorted : canonicalMains;
};

export const fetchAdminCategories = async () => {
  try {
    const res = await fetch(`${getAdminBackendUrl()}/api/admin/categories`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn("Failed to fetch admin categories:", err);
  }
  return [];
};
