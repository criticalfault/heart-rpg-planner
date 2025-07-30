import { getResponsiveHexConfig, RESPONSIVE_HEX_CONFIGS } from '../hexUtils';

describe('Responsive Hex Utils', () => {
  describe('getResponsiveHexConfig', () => {
    it('should return desktop config for large screens', () => {
      const config = getResponsiveHexConfig(1200);
      expect(config).toEqual(RESPONSIVE_HEX_CONFIGS.desktop);
    });

    it('should return tablet config for medium screens', () => {
      const config = getResponsiveHexConfig(800);
      expect(config).toEqual(RESPONSIVE_HEX_CONFIGS.tablet);
    });

    it('should return mobile config for small screens', () => {
      const config = getResponsiveHexConfig(600);
      expect(config).toEqual(RESPONSIVE_HEX_CONFIGS.mobile);
    });

    it('should return small config for very small screens', () => {
      const config = getResponsiveHexConfig(400);
      expect(config).toEqual(RESPONSIVE_HEX_CONFIGS.small);
    });

    it('should handle edge cases correctly', () => {
      expect(getResponsiveHexConfig(1024)).toEqual(RESPONSIVE_HEX_CONFIGS.desktop);
      expect(getResponsiveHexConfig(768)).toEqual(RESPONSIVE_HEX_CONFIGS.tablet);
      expect(getResponsiveHexConfig(480)).toEqual(RESPONSIVE_HEX_CONFIGS.mobile);
      expect(getResponsiveHexConfig(320)).toEqual(RESPONSIVE_HEX_CONFIGS.small);
    });
  });

  describe('RESPONSIVE_HEX_CONFIGS', () => {
    it('should have decreasing hex sizes for smaller screens', () => {
      const { desktop, tablet, mobile, small } = RESPONSIVE_HEX_CONFIGS;
      
      expect(desktop.hexSize).toBeGreaterThan(tablet.hexSize);
      expect(tablet.hexSize).toBeGreaterThan(mobile.hexSize);
      expect(mobile.hexSize).toBeGreaterThan(small.hexSize);
    });

    it('should have decreasing spacing for smaller screens', () => {
      const { desktop, tablet, mobile, small } = RESPONSIVE_HEX_CONFIGS;
      
      expect(desktop.spacing).toBeGreaterThan(tablet.spacing);
      expect(tablet.spacing).toBeGreaterThan(mobile.spacing);
      expect(mobile.spacing).toBeGreaterThan(small.spacing);
    });
  });
});