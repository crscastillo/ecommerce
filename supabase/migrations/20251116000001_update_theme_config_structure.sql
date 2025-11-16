-- Migration to update theme_config JSONB structure
-- This migration ensures theme_config has the correct fields for the new theme selector system
-- 
-- New fields added:
-- - admin_theme: Selected theme for admin dashboard (default, violet, rose, blue, etc.)
-- - store_theme: Selected theme for public storefront (default, violet, rose, blue, etc.)
-- 
-- Existing fields maintained:
-- - primary_color, secondary_color, accent_color, background_color, text_color
-- - font_family, favicon_url, custom_css
-- - hero_background_type, hero_background_value

-- Update existing tenants to have default theme structure if theme_config is empty or missing fields
UPDATE tenants
SET theme_config = jsonb_build_object(
  'admin_theme', COALESCE(theme_config->>'admin_theme', 'default'),
  'store_theme', COALESCE(theme_config->>'store_theme', 'default'),
  'primary_color', COALESCE(theme_config->>'primary_color', '#18181b'),
  'secondary_color', COALESCE(theme_config->>'secondary_color', '#71717a'),
  'accent_color', COALESCE(theme_config->>'accent_color', '#3b82f6'),
  'background_color', COALESCE(theme_config->>'background_color', '#ffffff'),
  'text_color', COALESCE(theme_config->>'text_color', '#09090b'),
  'font_family', COALESCE(theme_config->>'font_family', 'Inter'),
  'favicon_url', COALESCE(theme_config->>'favicon_url', ''),
  'custom_css', COALESCE(theme_config->>'custom_css', ''),
  'hero_background_type', COALESCE(theme_config->>'hero_background_type', 'color'),
  'hero_background_value', COALESCE(theme_config->>'hero_background_value', '#3B82F6')
)
WHERE theme_config IS NULL 
   OR theme_config = '{}'::jsonb
   OR NOT (theme_config ? 'admin_theme' AND theme_config ? 'store_theme');

-- Add comment to theme_config column documenting the expected structure
COMMENT ON COLUMN tenants.theme_config IS 
'JSONB object containing theme customization settings:
{
  "admin_theme": "default|violet|rose|blue|green|orange|slate|neutral|yellow|red",
  "store_theme": "default|violet|rose|blue|green|orange|slate|neutral|yellow|red",
  "primary_color": "#hex",
  "secondary_color": "#hex",
  "accent_color": "#hex",
  "background_color": "#hex",
  "text_color": "#hex",
  "font_family": "Inter|Roboto|Open Sans|Poppins|Lato",
  "favicon_url": "url",
  "custom_css": "css",
  "hero_background_type": "color|image",
  "hero_background_value": "#hex or url"
}';
