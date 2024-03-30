import { Button } from '../ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSettingsStore } from '@/lib/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

interface SettingsFormProps {
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SystemPromptSchema = z.object({
  systemPromptForRag: z.union([z.string().min(5, 'Prompt must be at least 5 characters long.'), z.literal('')]),
  systemPromptForRagSlim: z.union([z.string().min(5, 'Prompt must be at least 5 characters long.'), z.literal('')]),
});

type TSystemPromptSchema = z.infer<typeof SystemPromptSchema>;

const RagSystemPromptForm: React.FC<SettingsFormProps> = ({ setDialogOpen }) => {
  const { setSystemPromptForRag, systemPromptForRag, setSystemPromptForRagSlim, systemPromptForRagSlim } = useSettingsStore();

  const form = useForm<TSystemPromptSchema>({
    resolver: zodResolver(SystemPromptSchema),
    defaultValues: {
      systemPromptForRag: '',
      systemPromptForRagSlim: '',
    },
  });

  useEffect(() => {
    form.setValue('systemPromptForRag', systemPromptForRag ?? '');
    form.setValue('systemPromptForRagSlim', systemPromptForRagSlim ?? '');
  }, [form, systemPromptForRag, systemPromptForRagSlim]);

  const onSubmit = (data: TSystemPromptSchema) => {
    setSystemPromptForRag(data.systemPromptForRag);
    setSystemPromptForRagSlim(data.systemPromptForRagSlim);
    toast.success('Saved!');
  };

  return (
    <section>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="systemPromptForRag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt for RAG</FormLabel>
                <FormControl>
                  <Textarea rows={8} {...field} />
                </FormControl>
                <FormDescription>
                  Write a prompt that tells the AI how to use the document sections provided by the application to answer
                  your question.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="systemPromptForRagSlim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt for RAG (Slimmed)</FormLabel>
                <FormControl>
                  <Textarea rows={8} {...field} />
                </FormControl>
                <FormDescription>
                  A slimmed down version where the params are replaced with real content compared to the system prompt above wich is sent to the LLM as is.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right">
            <Button type="submit" className="px-7">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default RagSystemPromptForm;
