// Theme color definitions matching shadcn themes
// These convert hex colors to oklch format for CSS variables

export type ThemeId = 'default' | 'violet' | 'rose' | 'blue' | 'green' | 'orange' | 'slate' | 'neutral' | 'yellow' | 'red'

interface ThemeColors {
  light: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    muted: string
    mutedForeground: string
    destructive: string
    border: string
    input: string
    ring: string
  }
  dark: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    muted: string
    mutedForeground: string
    destructive: string
    border: string
    input: string
    ring: string
  }
}

export const THEME_COLORS: Record<ThemeId, ThemeColors> = {
  default: {
    light: {
      primary: 'oklch(0.205 0 0)', // zinc-900
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0 0)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0 0)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0 0)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.205 0 0)',
    },
    dark: {
      primary: 'oklch(0.922 0 0)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0 0)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0 0)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0 0)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  },
  violet: {
    light: {
      primary: 'oklch(0.532 0.193 293.756)', // violet-600
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0.005 293.756)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.894 0.058 293.756)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0.005 293.756)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.532 0.193 293.756)',
    },
    dark: {
      primary: 'oklch(0.781 0.136 293.756)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0.02 293.756)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0.02 293.756)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0.02 293.756)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  },
  rose: {
    light: {
      primary: 'oklch(0.546 0.213 13.428)', // rose-600
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0.01 13.428)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0.01 13.428)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0.01 13.428)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.546 0.213 13.428)',
    },
    dark: {
      primary: 'oklch(0.776 0.152 13.428)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0.02 13.428)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0.02 13.428)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0.02 13.428)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  },
  blue: {
    light: {
      primary: 'oklch(0.507 0.163 254.624)', // blue-600
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0.008 254.624)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0.008 254.624)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0.008 254.624)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.507 0.163 254.624)',
    },
    dark: {
      primary: 'oklch(0.741 0.117 254.624)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0.015 254.624)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0.015 254.624)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0.015 254.624)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  },
  green: {
    light: {
      primary: 'oklch(0.533 0.151 166.082)', // emerald-600
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0.008 166.082)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0.008 166.082)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0.008 166.082)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.533 0.151 166.082)',
    },
    dark: {
      primary: 'oklch(0.737 0.135 166.082)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0.015 166.082)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0.015 166.082)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0.015 166.082)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  },
  orange: {
    light: {
      primary: 'oklch(0.601 0.182 46.423)', // orange-600
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0.009 46.423)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0.009 46.423)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0.009 46.423)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.601 0.182 46.423)',
    },
    dark: {
      primary: 'oklch(0.794 0.132 46.423)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0.018 46.423)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0.018 46.423)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0.018 46.423)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  },
  slate: {
    light: {
      primary: 'oklch(0.276 0.02 246.088)', // slate-700
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0.003 246.088)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0.003 246.088)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0.003 246.088)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.276 0.02 246.088)',
    },
    dark: {
      primary: 'oklch(0.855 0.007 246.088)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0.01 246.088)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0.01 246.088)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0.01 246.088)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  },
  neutral: {
    light: {
      primary: 'oklch(0.238 0 0)', // neutral-800
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0 0)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0 0)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0 0)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.238 0 0)',
    },
    dark: {
      primary: 'oklch(0.922 0 0)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0 0)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0 0)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0 0)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  },
  yellow: {
    light: {
      primary: 'oklch(0.618 0.166 88.336)', // yellow-600
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.97 0.008 88.336)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0.008 88.336)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0.008 88.336)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.618 0.166 88.336)',
    },
    dark: {
      primary: 'oklch(0.869 0.149 88.336)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0.017 88.336)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0.017 88.336)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0.017 88.336)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  },
  red: {
    light: {
      primary: 'oklch(0.577 0.245 27.325)', // red-600
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0.012 27.325)',
      secondaryForeground: 'oklch(0.205 0 0)',
      accent: 'oklch(0.97 0.012 27.325)',
      accentForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0.012 27.325)',
      mutedForeground: 'oklch(0.556 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.577 0.245 27.325)',
    },
    dark: {
      primary: 'oklch(0.764 0.176 27.325)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0.022 27.325)',
      secondaryForeground: 'oklch(0.985 0 0)',
      accent: 'oklch(0.269 0.022 27.325)',
      accentForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0.022 27.325)',
      mutedForeground: 'oklch(0.708 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    }
  }
}
