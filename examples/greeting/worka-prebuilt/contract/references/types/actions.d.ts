import { z } from '@dsh-workbench/runtime';
export { note } from './model';
export declare const greeting: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>, "query">;
export declare const setName: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>, "mutation">;
