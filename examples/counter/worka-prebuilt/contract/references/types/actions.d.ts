import { z } from '@dsh-workbench/runtime';
export { note } from './model';
export declare const count: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    count: z.ZodNumber;
}, z.core.$strip>, "query">;
export declare const increment: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    count: z.ZodNumber;
}, z.core.$strip>, "mutation">;
export declare const reset: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    count: z.ZodNumber;
}, z.core.$strip>, "mutation">;
