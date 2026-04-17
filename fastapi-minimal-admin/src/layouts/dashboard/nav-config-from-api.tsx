import type { NavSectionProps } from 'src/components/nav-section';
import type { NavItemDataProps } from 'src/components/nav-section/types';
import type { IconifyName } from 'src/components/iconify/register-icons';

import { MenuType } from 'src/api/types';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/** Minimal shape of i18next's `t` — accept key, return translated string or the key itself. */
type TFn = (key: string, defaultValue?: string) => any;

/** Translate a title if it looks like an i18n key (contains a dot and no whitespace). */
function translateTitle(title: string, t?: TFn): string {
  if (!t || !title) return title;
  // Heuristic: keys look like `page.menu.system` or `code_generator.menu`
  if (!title.includes('.') || /\s/.test(title)) return title;
  const translated = t(title, title);
  return (typeof translated === 'string' ? translated : title) || title;
}

// ----------------------------------------------------------------------

/**
 * Vben5-formatted sidebar node returned by FBA `/sys/menus/sidebar`.
 * The display fields (title, icon, link, etc.) are wrapped in a `meta` object.
 */
interface Vben5MenuNode {
  id: number;
  name: string;
  path: string | null;
  parent_id: number | null;
  sort: number;
  type: MenuType;
  component: string | null;
  meta: {
    title: string;
    icon: string | null;
    link: string;
    iframeSrc: string;
    keepAlive: number;
    hideInMenu: boolean;
    menuVisibleWithForbidden: boolean;
  };
  children?: Vben5MenuNode[];
}

// ----------------------------------------------------------------------

function vben5NodeToNavItemData(nodes: Vben5MenuNode[], t?: TFn): NavItemDataProps[] {
  return nodes
    .filter((node) => !node.meta?.hideInMenu && node.type !== MenuType.BUTTON)
    .sort((a, b) => a.sort - b.sort)
    .map((node) => {
      const title = translateTitle(node.meta?.title ?? node.name ?? '', t);
      const icon = node.meta?.icon;

      // External link uses meta.link, embedded uses meta.iframeSrc
      let path = node.path ?? '';
      if (node.type === MenuType.LINK && node.meta?.link) {
        path = node.meta.link;
      } else if (node.type === MenuType.EMBEDDED && node.meta?.iframeSrc) {
        path = node.meta.iframeSrc;
      }

      const item: NavItemDataProps = {
        title,
        path,
        icon: icon ? <Iconify icon={icon as IconifyName} /> : undefined,
      };

      if (node.children && node.children.length > 0) {
        const childItems = vben5NodeToNavItemData(node.children, t);
        if (childItems.length > 0) {
          item.children = childItems;
        }
      }

      return item;
    });
}

// ----------------------------------------------------------------------

/**
 * Convert FBA Vben5 sidebar data to the NavSectionProps data format.
 * Top-level DIRECTORY menus become subheader groups; their children become the items.
 * Non-directory top-level menus are grouped under a single unnamed section.
 */
export function menuTreeToNavData(
  menus: Record<string, any>[] | null | undefined,
  t?: TFn
): NavSectionProps['data'] {
  if (!menus || menus.length === 0) {
    return [];
  }

  const visible = (menus as Vben5MenuNode[])
    .filter((m) => !m.meta?.hideInMenu && m.type !== MenuType.BUTTON)
    .sort((a, b) => a.sort - b.sort);

  const groups: NavSectionProps['data'] = [];
  const ungrouped: NavItemDataProps[] = [];

  for (const menu of visible) {
    const title = translateTitle(menu.meta?.title ?? menu.name ?? '', t);

    if (menu.type === MenuType.DIRECTORY) {
      const children = menu.children ? vben5NodeToNavItemData(menu.children, t) : [];

      // Use directory as a subheader group; fall back to self-link when no children
      groups.push({
        subheader: title,
        items:
          children.length > 0
            ? children
            : [{ title, path: menu.path ?? '' }],
      });
    } else {
      let path = menu.path ?? '';
      if (menu.type === MenuType.LINK && menu.meta?.link) {
        path = menu.meta.link;
      } else if (menu.type === MenuType.EMBEDDED && menu.meta?.iframeSrc) {
        path = menu.meta.iframeSrc;
      }

      const item: NavItemDataProps = {
        title,
        path,
        icon: menu.meta?.icon ? <Iconify icon={menu.meta.icon as IconifyName} /> : undefined,
      };

      if (menu.children && menu.children.length > 0) {
        const childItems = vben5NodeToNavItemData(menu.children, t);
        if (childItems.length > 0) {
          item.children = childItems;
        }
      }

      ungrouped.push(item);
    }
  }

  if (ungrouped.length > 0) {
    groups.unshift({ items: ungrouped });
  }

  // Filter out any accidentally-empty groups to keep NavSectionVertical happy
  return groups.filter((g) => g.items.length > 0);
}
