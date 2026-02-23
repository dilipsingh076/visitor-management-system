/**
 * Tests for authentication utilities.
 */
import {
  getPrimaryRole,
  canInviteVisitor,
  canAccessGuardPage,
  canAccessCheckin,
  isAuthenticated,
  getCachedUser,
  ROLE_LABELS,
} from '@/lib/auth';

describe('Auth Utilities', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('getPrimaryRole', () => {
    it('returns resident for null user', () => {
      expect(getPrimaryRole(null)).toBe('resident');
    });

    it('returns the user role if set', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        roles: ['guard'],
        role: 'guard',
        username: 'test',
      };
      expect(getPrimaryRole(user)).toBe('guard');
    });

    it('returns admin if in roles array', () => {
      const user = {
        id: '1',
        email: 'admin@example.com',
        roles: ['admin', 'guard', 'resident'],
        username: 'admin',
      };
      expect(getPrimaryRole(user)).toBe('admin');
    });

    it('returns guard if admin not in roles', () => {
      const user = {
        id: '1',
        email: 'guard@example.com',
        roles: ['guard', 'resident'],
        username: 'guard',
      };
      expect(getPrimaryRole(user)).toBe('guard');
    });

    it('returns resident if no higher role', () => {
      const user = {
        id: '1',
        email: 'resident@example.com',
        roles: ['resident'],
        username: 'resident',
      };
      expect(getPrimaryRole(user)).toBe('resident');
    });
  });

  describe('canInviteVisitor', () => {
    it('returns true for resident', () => {
      const user = {
        id: '1',
        email: 'resident@example.com',
        roles: ['resident'],
        role: 'resident',
        username: 'resident',
      };
      expect(canInviteVisitor(user)).toBe(true);
    });

    it('returns true for admin', () => {
      const user = {
        id: '1',
        email: 'admin@example.com',
        roles: ['admin'],
        role: 'admin',
        username: 'admin',
      };
      expect(canInviteVisitor(user)).toBe(true);
    });

    it('returns false for guard', () => {
      const user = {
        id: '1',
        email: 'guard@example.com',
        roles: ['guard'],
        role: 'guard',
        username: 'guard',
      };
      expect(canInviteVisitor(user)).toBe(false);
    });

    it('returns false for null user', () => {
      expect(canInviteVisitor(null)).toBe(true);
    });
  });

  describe('canAccessGuardPage', () => {
    it('returns true for guard', () => {
      const user = {
        id: '1',
        email: 'guard@example.com',
        roles: ['guard'],
        role: 'guard',
        username: 'guard',
      };
      expect(canAccessGuardPage(user)).toBe(true);
    });

    it('returns true for admin', () => {
      const user = {
        id: '1',
        email: 'admin@example.com',
        roles: ['admin'],
        role: 'admin',
        username: 'admin',
      };
      expect(canAccessGuardPage(user)).toBe(true);
    });

    it('returns false for resident', () => {
      const user = {
        id: '1',
        email: 'resident@example.com',
        roles: ['resident'],
        role: 'resident',
        username: 'resident',
      };
      expect(canAccessGuardPage(user)).toBe(false);
    });
  });

  describe('canAccessCheckin', () => {
    it('returns true for guard', () => {
      const user = {
        id: '1',
        email: 'guard@example.com',
        roles: ['guard'],
        role: 'guard',
        username: 'guard',
      };
      expect(canAccessCheckin(user)).toBe(true);
    });

    it('returns true for admin', () => {
      const user = {
        id: '1',
        email: 'admin@example.com',
        roles: ['admin'],
        role: 'admin',
        username: 'admin',
      };
      expect(canAccessCheckin(user)).toBe(true);
    });

    it('returns false for resident', () => {
      const user = {
        id: '1',
        email: 'resident@example.com',
        roles: ['resident'],
        role: 'resident',
        username: 'resident',
      };
      expect(canAccessCheckin(user)).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no user stored', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when user is in sessionStorage', () => {
      const user = { id: '1', email: 'test@example.com', roles: [], username: 'test' };
      sessionStorage.setItem('vms_user', JSON.stringify(user));
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('getCachedUser', () => {
    it('returns null when no user stored', () => {
      expect(getCachedUser()).toBe(null);
    });

    it('returns user from sessionStorage', () => {
      const user = { id: '1', email: 'test@example.com', roles: ['resident'], username: 'test' };
      sessionStorage.setItem('vms_user', JSON.stringify(user));
      const cached = getCachedUser();
      expect(cached).toEqual(user);
    });

    it('returns null for invalid JSON', () => {
      sessionStorage.setItem('vms_user', 'invalid json');
      expect(getCachedUser()).toBe(null);
    });
  });

  describe('ROLE_LABELS', () => {
    it('has correct labels', () => {
      expect(ROLE_LABELS.admin).toBe('Admin');
      expect(ROLE_LABELS.guard).toBe('Guard');
      expect(ROLE_LABELS.resident).toBe('Resident');
    });
  });
});
