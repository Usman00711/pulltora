import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { repositoryService } from '@/services/repository-service';

const repoSchema = z.object({
  owner: z.string().min(2, 'Repository owner is required'),
  name: z.string().min(1, 'Repository name is required'),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
  language: z.string().max(120, 'Language is too long').optional().or(z.literal('')),
  defaultBranch: z.string().max(120, 'Default branch is too long').optional().or(z.literal(''))
});

type RepoForm = z.infer<typeof repoSchema>;

export default function RepositoryNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RepoForm>({
    resolver: zodResolver(repoSchema),
    defaultValues: {
      owner: '',
      name: '',
      description: '',
      language: '',
      defaultBranch: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: repositoryService.create,
    onSuccess: async (repo) => {
      await queryClient.invalidateQueries({ queryKey: ['repositories'] });
      setSuccessMessage('Repository added. Redirecting...');
      navigate(`/repositories/${repo.id}`);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create repository');
    }
  });

  const onSubmit = (values: RepoForm) => {
    setErrorMessage('');
    setSuccessMessage('');

    createMutation.mutate({
      owner: values.owner.trim(),
      name: values.name.trim(),
      description: values.description || undefined,
      language: values.language || undefined,
      defaultBranch: values.defaultBranch || undefined
    });
  };

  return (
    <section className="mx-auto max-w-xl">
      <div className="panel hover-lift motion-fade-up p-8">
        <p className="kpi-badge">Connect Repository</p>
        <h1 className="mt-2 text-3xl font-bold">Add Repository</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connect a repository to start pull request and issue risk analysis.</p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Repository Owner</span>
            <input className="glass-input" placeholder="acme" {...register('owner')} />
            {errors.owner && <span className="text-sm text-red-300">{errors.owner.message}</span>}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Repository Name</span>
            <input className="glass-input" placeholder="api-service" {...register('name')} />
            {errors.name && <span className="text-sm text-red-300">{errors.name.message}</span>}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              className="glass-input min-h-20"
              placeholder="Optional description"
              {...register('description')}
            />
            {errors.description && <span className="text-sm text-red-300">{errors.description.message}</span>}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Primary Language</span>
            <input className="glass-input" placeholder="TypeScript" {...register('language')} />
            {errors.language && <span className="text-sm text-red-300">{errors.language.message}</span>}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Default Branch</span>
            <input className="glass-input" placeholder="main" {...register('defaultBranch')} />
            {errors.defaultBranch && <span className="text-sm text-red-300">{errors.defaultBranch.message}</span>}
          </label>

          <button type="submit" className="btn-primary mt-2" disabled={isSubmitting || createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Save repository'}
          </button>
        </form>

        {errorMessage && <p className="mt-3 text-sm text-red-300">{errorMessage}</p>}
        {successMessage && <p className="mt-3 text-sm text-green-300">{successMessage}</p>}
        <p className="mt-4 text-sm">
          <Link to="/repositories" className="font-semibold text-brand">Cancel</Link>
        </p>
      </div>
    </section>
  );
}
