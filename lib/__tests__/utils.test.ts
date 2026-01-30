import { cn } from '../utils';

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            expect(cn('class1', 'class2')).toBe('class1 class2');
        });

        it('should handle conditional classes', () => {
            expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
        });

        it('should merge tailwind classes', () => {
            // tailwind-merge should handle conflicting classes
            expect(cn('p-4', 'p-2')).toBe('p-2');
            expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
        });

        it('should handle undefined and null inputs', () => {
            expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
        });
    });
});
