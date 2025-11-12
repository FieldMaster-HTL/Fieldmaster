import { POST } from '../../../../../src/app/api/clerk/webhooks/route';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { MUTATIONS } from '../../../../../src/server/db/queries/queries';

// Mock the Clerk webhook verification
jest.mock('@clerk/nextjs/webhooks', () => ({
  verifyWebhook: jest.fn(),
}));

// Mock the database mutations
jest.mock('../../../../../src/server/db/queries/queries', () => ({
  MUTATIONS: {
    USER: {
      createUser: jest.fn(),
      deleteByClerkId: jest.fn(),
      updateByClerkId: jest.fn(),
    },
    FARM: {
      createFarm: jest.fn(),
      updateFarmByClerkId: jest.fn(),
      deleteFarmByClerkId: jest.fn(),
    },
  },
}));

// Mock the global Response object
global.Response = jest.fn((body, init) => ({
  body: body,
  status: init?.status || 200,
  headers: init?.headers || new Headers(),
  text: () => Promise.resolve(body),
})) as jest.Mock;

describe('Clerk Webhook API', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'svix-id') return 'test_svix_id';
          if (header === 'svix-timestamp') return 'test_svix_timestamp';
          if (header === 'svix-signature') return 'test_svix_signature';
          return null;
        }),
      },
      json: jest.fn(),
      text: jest.fn().mockResolvedValue('{}'), // Default empty body
    } as unknown as NextRequest;
  });

  it('should return 200 for unhandled event types', async () => {
    (verifyWebhook as jest.Mock).mockResolvedValue({ type: 'unhandled.event' } as WebhookEvent);

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Webhook received');
    expect(verifyWebhook).toHaveBeenCalledWith(mockRequest);
    expect(MUTATIONS.USER.createUser).not.toHaveBeenCalled();
    expect(MUTATIONS.FARM.createFarm).not.toHaveBeenCalled();
  });

  it('should handle user.created event', async () => {
    const mockEvent: WebhookEvent = {
      type: 'user.created',
      data: {
        id: 'user_123',
        first_name: 'John',
        last_name: 'Doe',
      },
    } as unknown as WebhookEvent;
    (verifyWebhook as jest.Mock).mockResolvedValue(mockEvent);

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Webhook received');
    expect(MUTATIONS.USER.createUser).toHaveBeenCalledWith('user_123', 'John', 'Doe');
  });

  it('should handle user.deleted event', async () => {
    const mockEvent: WebhookEvent = {
      type: 'user.deleted',
      data: {
        id: 'user_123',
      },
    } as unknown as WebhookEvent;
    (verifyWebhook as jest.Mock).mockResolvedValue(mockEvent);

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Webhook received');
    expect(MUTATIONS.USER.deleteByClerkId).toHaveBeenCalledWith('user_123');
  });

  it('should throw error for user.deleted event if clerk id is null', async () => {
    const mockEvent: WebhookEvent = {
      type: 'user.deleted',
      data: {
        id: null,
      },
    } as unknown as WebhookEvent;
    (verifyWebhook as jest.Mock).mockResolvedValue(mockEvent);

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Error verifying webhook');
  });

  it('should handle user.updated event', async () => {
    const mockEvent: WebhookEvent = {
      type: 'user.updated',
      data: {
        id: 'user_123',
        first_name: 'Jane',
        last_name: 'Smith',
      },
    } as unknown as WebhookEvent;
    (verifyWebhook as jest.Mock).mockResolvedValue(mockEvent);

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Webhook received');
    expect(MUTATIONS.USER.updateByClerkId).toHaveBeenCalledWith('user_123', {
      firstName: 'Jane',
      lastName: 'Smith',
    });
  });

  it('should handle organization.created event', async () => {
    const mockEvent: WebhookEvent = {
      type: 'organization.created',
      data: {
        id: 'org_123',
        name: 'Test Org',
        slug: 'test-org',
        created_by: 'user_456',
      },
    } as unknown as WebhookEvent;
    (verifyWebhook as jest.Mock).mockResolvedValue(mockEvent);

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Webhook received');
    expect(MUTATIONS.FARM.createFarm).toHaveBeenCalledWith('org_123', 'Test Org', 'test-org', 'user_456');
  });

  it('should handle organization.updated event', async () => {
    const mockEvent: WebhookEvent = {
      type: 'organization.updated',
      data: {
        id: 'org_123',
        name: 'Updated Org',
        slug: 'updated-org',
      },
    } as unknown as WebhookEvent;
    (verifyWebhook as jest.Mock).mockResolvedValue(mockEvent);

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Webhook received');
    expect(MUTATIONS.FARM.updateFarmByClerkId).toHaveBeenCalledWith('org_123', {
      name: 'Updated Org',
      slug: 'updated-org',
    });
  });

  it('should handle organization.deleted event', async () => {
    const mockEvent: WebhookEvent = {
      type: 'organization.deleted',
      data: {
        id: 'org_123',
      },
    } as unknown as WebhookEvent;
    (verifyWebhook as jest.Mock).mockResolvedValue(mockEvent);

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Webhook received');
    expect(MUTATIONS.FARM.deleteFarmByClerkId).toHaveBeenCalledWith('org_123');
  });

  it('should throw error for organization.deleted event if clerk id is null', async () => {
    const mockEvent: WebhookEvent = {
      type: 'organization.deleted',
      data: {
        id: null,
      },
    } as unknown as WebhookEvent;
    (verifyWebhook as jest.Mock).mockResolvedValue(mockEvent);

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Error verifying webhook');
  });

  it('should return 400 if webhook verification fails', async () => {
    (verifyWebhook as jest.Mock).mockRejectedValue(new Error('Invalid webhook signature'));

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Error verifying webhook');
  });
});