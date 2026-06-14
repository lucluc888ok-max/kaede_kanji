import type { Theme, ThemeId } from '../types'

export const THEMES: Record<ThemeId, Theme> = {
  default:  { id: 'default',  name: 'ふつうの空', emoji: '🏠', cssClass: 'theme-default',  price: 0,   gradient: 'radial-gradient(circle, #F5F9FC 0%, #EBF3F9 100%)' },
  beach:    { id: 'beach',    name: '夏のビーチ',  emoji: '🏖️', cssClass: 'theme-beach',    price: 50,  gradient: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)' },
  forest:   { id: 'forest',   name: '秋の森',      emoji: '🍁', cssClass: 'theme-forest',   price: 80,  gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' },
  mountain: { id: 'mountain', name: '雪山',        emoji: '🏔️', cssClass: 'theme-mountain', price: 120, gradient: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)' },
  space:    { id: 'space',    name: '宇宙',        emoji: '🌌', cssClass: 'theme-space',    price: 200, gradient: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)' },
  castle:   { id: 'castle',   name: 'お城',        emoji: '🏰', cssClass: 'theme-castle',   price: 300, gradient: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)' },
}
