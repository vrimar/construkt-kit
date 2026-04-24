import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@b3/styled-system/jsx";

import { Icon } from "../Icon";
import { Input } from "../Input";
import { Popover } from "../Popover";
import { Text } from "../Text";

type FontOption = {
  name: string;
  value: string;
  google: string;
};

const FONT_OPTIONS: FontOption[] = [
  // Current default
  { name: "Inter", value: "Inter Variable", google: "Inter:wght@300..700" },

  // Clean geometric / modern SaaS
  { name: "DM Sans", value: "DM Sans", google: "DM+Sans:wght@300..700" },
  {
    name: "Plus Jakarta Sans",
    value: "Plus Jakarta Sans",
    google: "Plus+Jakarta+Sans:wght@300..700",
  },
  { name: "Manrope", value: "Manrope", google: "Manrope:wght@300..700" },
  { name: "Outfit", value: "Outfit", google: "Outfit:wght@300..700" },
  { name: "Figtree", value: "Figtree", google: "Figtree:wght@300..700" },
  { name: "Albert Sans", value: "Albert Sans", google: "Albert+Sans:wght@300..700" },
  { name: "Sora", value: "Sora", google: "Sora:wght@300..700" },
  { name: "Geist Sans", value: "Geist", google: "Geist:wght@300..700" },
  { name: "Urbanist", value: "Urbanist", google: "Urbanist:wght@300..700" },
  { name: "Lexend", value: "Lexend", google: "Lexend:wght@300..700" },
  { name: "Space Grotesk", value: "Space Grotesk", google: "Space+Grotesk:wght@300..700" },
  { name: "General Sans", value: "General Sans", google: "General+Sans:wght@300..700" },

  // Humanist / friendly
  { name: "Nunito Sans", value: "Nunito Sans", google: "Nunito+Sans:wght@300..700" },
  { name: "Work Sans", value: "Work Sans", google: "Work+Sans:wght@300..700" },
  { name: "Rubik", value: "Rubik", google: "Rubik:wght@300..700" },
  { name: "Karla", value: "Karla", google: "Karla:wght@300..700" },
  { name: "Nunito", value: "Nunito", google: "Nunito:wght@300..700" },
  { name: "Cabin", value: "Cabin", google: "Cabin:wght@400..700" },
  { name: "Quicksand", value: "Quicksand", google: "Quicksand:wght@300..700" },
  { name: "Varela Round", value: "Varela Round", google: "Varela+Round" },

  // Neutral / enterprise
  { name: "Source Sans 3", value: "Source Sans 3", google: "Source+Sans+3:wght@300..700" },
  { name: "Roboto", value: "Roboto", google: "Roboto:wght@300..700" },
  { name: "Open Sans", value: "Open Sans", google: "Open+Sans:wght@300..700" },
  { name: "Lato", value: "Lato", google: "Lato:wght@300;400;700" },
  { name: "Poppins", value: "Poppins", google: "Poppins:wght@300;400;500;600;700" },
  { name: "Noto Sans", value: "Noto Sans", google: "Noto+Sans:wght@300..700" },
  {
    name: "IBM Plex Sans",
    value: "IBM Plex Sans",
    google: "IBM+Plex+Sans:wght@300;400;500;600;700",
  },
  { name: "Barlow", value: "Barlow", google: "Barlow:wght@300;400;500;600;700" },
  { name: "Public Sans", value: "Public Sans", google: "Public+Sans:wght@300..700" },
  { name: "Mukta", value: "Mukta", google: "Mukta:wght@300;400;500;600;700" },

  // Technical / monospace-adjacent
  { name: "Red Hat Display", value: "Red Hat Display", google: "Red+Hat+Display:wght@300..700" },
  { name: "Red Hat Text", value: "Red Hat Text", google: "Red+Hat+Text:wght@300..700" },
  { name: "Overpass", value: "Overpass", google: "Overpass:wght@300..700" },
  { name: "Exo 2", value: "Exo 2", google: "Exo+2:wght@300..700" },
  { name: "Titillium Web", value: "Titillium Web", google: "Titillium+Web:wght@300;400;600;700" },

  // Elegant / premium
  { name: "Jost", value: "Jost", google: "Jost:wght@300..700" },
  { name: "Montserrat", value: "Montserrat", google: "Montserrat:wght@300..700" },
  { name: "Raleway", value: "Raleway", google: "Raleway:wght@300..700" },
  { name: "Libre Franklin", value: "Libre Franklin", google: "Libre+Franklin:wght@300..700" },
  { name: "Josefin Sans", value: "Josefin Sans", google: "Josefin+Sans:wght@300..700" },
  { name: "Archivo", value: "Archivo", google: "Archivo:wght@300..700" },

  // Compact / data-dense
  { name: "Roboto Condensed", value: "Roboto Condensed", google: "Roboto+Condensed:wght@300..700" },
  {
    name: "Barlow Semi Condensed",
    value: "Barlow Semi Condensed",
    google: "Barlow+Semi+Condensed:wght@300;400;500;600;700",
  },
  { name: "Encode Sans", value: "Encode Sans", google: "Encode+Sans:wght@300..700" },

  // System fonts (no Google load needed)
  { name: "Arial", value: "Arial", google: "" },
];

const FALLBACK_STACK =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"';

const loadedFonts = new Set<string>();

function loadGoogleFont(google: string) {
  if (!google || loadedFonts.has(google)) return;
  loadedFonts.add(google);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${google}&display=swap`;
  document.head.appendChild(link);
}

// Preload all fonts so previews render correctly
function preloadAllFonts() {
  for (const font of FONT_OPTIONS) {
    loadGoogleFont(font.google);
  }
}

function TypeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 7 4 4 20 4 20 7" />
      <line
        x1="9"
        y1="20"
        x2="15"
        y2="20"
      />
      <line
        x1="12"
        y1="4"
        x2="12"
        y2="20"
      />
    </svg>
  );
}

export interface DebugFontSwitcherProps {
  /** Default font value to start with. Defaults to "Inter Variable". */
  defaultFont?: string;
}

export const DebugFontSwitcher = ({ defaultFont = "Inter Variable" }: DebugFontSwitcherProps) => {
  const [activeFont, setActiveFont] = useState(defaultFont);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const preloaded = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search) return FONT_OPTIONS;
    const q = search.toLowerCase();
    return FONT_OPTIONS.filter((f) => f.name.toLowerCase().includes(q));
  }, [search]);

  // Reset search and highlight when opening/closing
  useEffect(() => {
    if (open) {
      setSearch("");
      setHighlightIndex(0);
      // Focus search input after popover opens
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  // Preload all fonts on first open
  useEffect(() => {
    if (open && !preloaded.current) {
      preloaded.current = true;
      preloadAllFonts();
    }
  }, [open]);

  // Keep highlight in bounds when filter changes
  useEffect(() => {
    setHighlightIndex(0);
  }, [search]);

  // Scroll highlighted item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[highlightIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex]);

  const applyFont = useCallback((fontValue: string) => {
    setActiveFont(fontValue);
    document.documentElement.style.setProperty(
      "--global-font-body",
      `"${fontValue}", ${FALLBACK_STACK}`,
    );
    document.body.style.fontFamily = `"${fontValue}", ${FALLBACK_STACK}`;
  }, []);

  const handleSelect = useCallback(
    (font: FontOption) => {
      loadGoogleFont(font.google);
      applyFont(font.value);
    },
    [applyFont],
  );

  const handleReset = useCallback(() => {
    setActiveFont(defaultFont);
    document.documentElement.style.removeProperty("--global-font-body");
    document.body.style.fontFamily = "";
  }, [defaultFont]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = Math.min(highlightIndex + 1, filtered.length - 1);
          setHighlightIndex(next);
          if (filtered[next]) handleSelect(filtered[next]);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = Math.max(highlightIndex - 1, 0);
          setHighlightIndex(prev);
          if (filtered[prev]) handleSelect(filtered[prev]);
          break;
        }
        case "Enter":
          e.preventDefault();
          if (filtered[highlightIndex]) {
            handleSelect(filtered[highlightIndex]);
          }
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    },
    [filtered, highlightIndex, handleSelect],
  );

  return (
    <Box
      position="fixed"
      bottom="7"
      right="200px"
      zIndex="9999"
    >
      <Popover.Root
        placement="top-start"
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <Popover.Trigger asChild>
          <Box
            as="button"
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="36px"
            height="36px"
            borderRadius="lg"
            bg="bg"
            border="1px solid"
            borderColor="border"
            boxShadow="md"
            cursor="pointer"
            _hover={{ bg: "bg.muted" }}
            title="Debug: Font Switcher"
          >
            <Icon color="fg.muted">
              <TypeIcon />
            </Icon>
          </Box>
        </Popover.Trigger>

        <Popover.Content
          width="280px"
          maxHeight="420px"
          onKeyDown={handleKeyDown}
        >
          <Popover.Header
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px="3"
            py="2"
          >
            <Text
              fontWeight="semibold"
              fontSize="sm"
            >
              Font Switcher
            </Text>
            <Box
              as="button"
              fontSize="xs"
              color="fg.muted"
              cursor="pointer"
              _hover={{ color: "fg" }}
              onClick={handleReset}
            >
              Reset
            </Box>
          </Popover.Header>

          <Box
            px="3"
            pb="2"
          >
            <Input
              ref={searchRef}
              size="sm"
              placeholder="Search fonts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          <Popover.Body
            ref={listRef}
            p="0"
            px="2"
            overflowY="auto"
            maxHeight="300px"
          >
            {filtered.length === 0 && (
              <Box
                px="3"
                py="4"
              >
                <Text
                  fontSize="sm"
                  color="fg.muted"
                >
                  No fonts match "{search}"
                </Text>
              </Box>
            )}
            {filtered.map((font, index) => (
              <Box
                key={font.name}
                as="button"
                display="flex"
                flexDirection="column"
                gap="0.5"
                width="100%"
                textAlign="left"
                px="3"
                py="2"
                cursor="pointer"
                bg={
                  activeFont === font.value
                    ? "bg.emphasized"
                    : index === highlightIndex
                      ? "bg.muted"
                      : "transparent"
                }
                _hover={{ bg: "bg.muted" }}
                onClick={() => handleSelect(font)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  fontFamily={`"${font.value}", ${FALLBACK_STACK}`}
                >
                  {font.name}
                </Text>
                <Text
                  fontSize="xs"
                  color="fg.muted"
                  fontFamily={`"${font.value}", ${FALLBACK_STACK}`}
                >
                  The quick brown fox jumps over the lazy dog
                </Text>
              </Box>
            ))}
          </Popover.Body>
        </Popover.Content>
      </Popover.Root>
    </Box>
  );
};
