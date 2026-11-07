import type { ImageSource } from 'expo-image';
import type { Permission } from '@/utils/permissions';

export type ImageInput = ImageSource | number | string | null;

/**
 * ONDE COLOCAR AS IMAGENS
 * 1. Salve os arquivos em `assets/images/` (jpg, png ou webp).
 * 2. Troque o `null` correspondente por `require('../assets/images/arquivo.jpg')`.
 * Enquanto estiver `null`, o app mostra um espaço reservado no lugar.
 *
 * Tamanhos sugeridos:
 *  - loginHero / registerHero: vertical ou quadrada, mínimo 1200 x 1600
 *  - homeBanner: panorâmica, mínimo 1800 x 560
 *  - modules.*: 16:9, mínimo 800 x 450
 */
export const images: {
  loginHero: ImageInput;
  registerHero: ImageInput;
  homeBanner: ImageInput;
  modules: Partial<Record<Permission, ImageInput>>;
} = {
  loginHero: null, // require('../assets/images/login-hero.jpg')
  registerHero: null, // require('../assets/images/register-hero.jpg')
  homeBanner: null, // require('../assets/images/home-banner.jpg')
  modules: {
    vehicles: null, // require('../assets/images/module-vehicles.jpg')
    customers: null, // require('../assets/images/module-customers.jpg')
    sales: null, // require('../assets/images/module-sales.jpg')
    finance: null, // require('../assets/images/module-finance.jpg')
    marketing: null, // require('../assets/images/module-marketing.jpg')
    aftersales: null, // require('../assets/images/module-aftersales.jpg')
    team: null, // require('../assets/images/module-team.jpg')
    subscription: null, // require('../assets/images/module-subscription.jpg')
  },
};
