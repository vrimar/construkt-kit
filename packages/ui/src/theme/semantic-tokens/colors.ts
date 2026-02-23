import { defineSemanticTokens } from "@chakra-ui/react";

export const colors = defineSemanticTokens.colors({
  bg: {
    DEFAULT: {
      value: {
        _light: "white",
        _dark: "{colors.gray.900}",
      },
    },
    subtle: {
      value: {
        _light: "{colors.gray.50}",
        _dark: "{colors.gray.800}",
      },
    },
    muted: {
      value: {
        _light: "{colors.gray.100}",
        _dark: "{colors.gray.700}",
      },
    },
    emphasized: {
      value: {
        _light: "{colors.gray.200}",
        _dark: "{colors.gray.600}",
      },
    },
    inverted: {
      value: {
        _light: "{colors.gray.900}",
        _dark: "{colors.gray.50}",
      },
    },
  },
  fg: {
    DEFAULT: {
      value: {
        _light: "{colors.gray.900}",
        _dark: "{colors.gray.50}",
      },
    },
    muted: {
      value: {
        _light: "{colors.gray.600}",
        _dark: "{colors.gray.400}",
      },
    },
    subtle: {
      value: {
        _light: "{colors.gray.400}",
        _dark: "{colors.gray.500}",
      },
    },
    inverted: {
      value: {
        _light: "{colors.gray.50}",
        _dark: "{colors.black}",
      },
    },
    error: {
      value: {
        _light: "{colors.red.500}",
        _dark: "{colors.red.400}",
      },
    },
    warning: {
      value: {
        _light: "{colors.orange.600}",
        _dark: "{colors.orange.300}",
      },
    },
    success: {
      value: {
        _light: "{colors.green.600}",
        _dark: "{colors.green.300}",
      },
    },
    info: {
      value: {
        _light: "{colors.blue.600}",
        _dark: "{colors.blue.300}",
      },
    },
  },
  border: {
    DEFAULT: {
      value: {
        _light: "{colors.gray.300}",
        _dark: "{colors.gray.700}",
      },
    },
    muted: {
      value: {
        _light: "{colors.gray.100}",
        _dark: "{colors.gray.800}",
      },
    },
    subtle: {
      value: {
        _light: "{colors.gray.50}",
        _dark: "{colors.gray.900}",
      },
    },
    emphasized: {
      value: {
        _light: "{colors.gray.500}",
        _dark: "{colors.gray.600}",
      },
    },
    inverted: {
      value: {
        _light: "{colors.gray.800}",
        _dark: "{colors.gray.200}",
      },
    },
    error: {
      value: {
        _light: "{colors.red.500}",
        _dark: "{colors.red.400}",
      },
    },
    warning: {
      value: {
        _light: "{colors.orange.500}",
        _dark: "{colors.orange.400}",
      },
    },
    success: {
      value: {
        _light: "{colors.green.500}",
        _dark: "{colors.green.400}",
      },
    },
    info: {
      value: {
        _light: "{colors.blue.500}",
        _dark: "{colors.blue.400}",
      },
    },
  },
  primary: {
    DEFAULT: {
      value: {
        _light: "{colors.brand.500}",
        _dark: "{colors.brand.400}",
      },
    },
    contrast: {
      value: {
        _light: "white",
        _dark: "white",
      },
    },
    fg: {
      value: {
        _light: "{colors.brand.700}",
        _dark: "{colors.brand.400}",
      },
    },
    subtle: {
      value: {
        _light: "{colors.brand.100}",
        _dark: "{colors.brand.900}",
      },
    },
    muted: {
      value: {
        _light: "{colors.brand.300}",
        _dark: "{colors.brand.700}",
      },
    },
    emphasized: {
      value: {
        _light: "{colors.brand.300}",
        _dark: "{colors.brand.600}",
      },
    },
    solid: {
      value: {
        _light: "{colors.brand.600}",
        _dark: "{colors.brand.500}",
      },
    },
    focusRing: {
      value: {
        _light: "{colors.brand.600}",
        _dark: "{colors.brand.600}",
      },
    },
  },
});
