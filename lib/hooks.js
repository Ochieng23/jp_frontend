'use client';
/**
 * lib/hooks.js — SWR-based data fetching hooks
 *
 * All backend responses are wrapped as { data: <payload>, total?, ... }.
 * Each hook unwraps `.data` before returning.
 */

import useSWR from 'swr';
import { get } from './api';

const fetcher = (endpoint) => get(endpoint);
const keyFetcher = ([endpoint]) => get(endpoint);

// ─── User / Passport ─────────────────────────────────────────────────────────

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR('/passport/me', fetcher);
  return {
    user: data?.data ?? null,   // backend: { data: holder }
    isLoading,
    error,
    mutate,
  };
}

// ─── Credentials ─────────────────────────────────────────────────────────────

export function useCredentials(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type)            params.set('type', filters.type);
  if (filters.status)          params.set('status', filters.status);
  if (filters.jurisdiction_id) params.set('jurisdiction_id', filters.jurisdiction_id);
  if (filters.page)            params.set('page', filters.page);
  if (filters.pageSize)        params.set('pageSize', filters.pageSize);
  const query = params.toString();
  const endpoint = `/credentials${query ? '?' + query : ''}`;

  const { data, error, isLoading, mutate } = useSWR([endpoint, filters], keyFetcher);
  return {
    credentials: data?.data ?? [],          // backend: { data: [...], total, hasNext }
    total:       data?.total ?? 0,
    hasNext:     data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
}

export function useCredential(id) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/credentials/${id}` : null, fetcher);
  return {
    credential: data?.data ?? null,         // backend: { data: credential }
    isLoading,
    error,
    mutate,
  };
}

// ─── Work History ─────────────────────────────────────────────────────────────

export function useWorkHistory() {
  const { data, error, isLoading, mutate } = useSWR('/work-experience', fetcher);
  return {
    entries: data?.data ?? [],              // backend: { data: entries, total }
    isLoading,
    error,
    mutate,
  };
}

// ─── Recognition ─────────────────────────────────────────────────────────────

export function useRecognition(holderId) {
  const endpoint = holderId ? `/recognition` : null;

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher);
  return {
    matrix: data?.data ?? [],               // backend: { data: matrix, total }
    isLoading,
    error,
    mutate,
  };
}

// ─── Organisations ────────────────────────────────────────────────────────────

export function useOrganizations(filters = {}) {
  const params = new URLSearchParams();
  if (filters.jurisdiction_id) params.set('jurisdiction_id', filters.jurisdiction_id);
  if (filters.type)            params.set('type', filters.type);
  if (filters.verified !== undefined) params.set('verified', filters.verified);
  const query = params.toString();
  const endpoint = `/organizations${query ? '?' + query : ''}`;

  const { data, error, isLoading, mutate } = useSWR([endpoint, filters], keyFetcher);
  return {
    organizations: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

// ─── Jurisdictions ────────────────────────────────────────────────────────────

export function useJurisdictions() {
  const { data, error, isLoading, mutate } = useSWR('/jurisdictions', fetcher);
  return {
    jurisdictions: Array.isArray(data) ? data : (data?.data ?? data?.jurisdictions ?? []),
    isLoading,
    error,
    mutate,
  };
}

// ─── Job board ────────────────────────────────────────────────────────────────

export function useJobs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.page)             params.set('page', filters.page);
  if (filters.pageSize)         params.set('pageSize', filters.pageSize);
  if (filters.location)         params.set('location', filters.location);
  if (filters.jobType)          params.set('jobType', filters.jobType);
  if (filters.experienceLevel)  params.set('experienceLevel', filters.experienceLevel);
  if (filters.skill)            params.set('skill', filters.skill);
  if (filters.search)           params.set('search', filters.search);
  const query = params.toString();
  const endpoint = `/jobs${query ? '?' + query : ''}`;

  const { data, error, isLoading, mutate } = useSWR([endpoint, filters], keyFetcher);
  return {
    jobs:    data?.data ?? [],               // backend: { data: [...], total, page, pageSize, hasNext }
    total:   data?.total ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
}

export function useJob(id) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/jobs/${id}` : null, fetcher);
  return {
    job: data?.data ?? null,                 // backend: { data: job }
    isLoading,
    error,
    mutate,
  };
}

export function useMyApplications() {
  const { data, error, isLoading, mutate } = useSWR('/jobs/applications', fetcher);
  return {
    applications: data?.data ?? [],          // backend: { data: [...], total }
    isLoading,
    error,
    mutate,
  };
}

// ─── Audit log ────────────────────────────────────────────────────────────────

export function useAuditLog(page = 1) {
  const { data, error, isLoading, mutate } = useSWR(`/passport/me/audit?page=${page}`, fetcher);
  return {
    events:  data?.data ?? [],
    total:   data?.total ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
}
