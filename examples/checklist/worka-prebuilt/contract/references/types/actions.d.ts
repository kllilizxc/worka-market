import { z } from '@dsh-workbench/runtime';
export { note } from './model';
export declare const list: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, import("@dsh-workbench/runtime").PageSchema<import("@dsh-workbench/runtime").ProjectedSchema<z.ZodObject<{
    text: z.ZodString;
    done: z.ZodBoolean;
}, z.core.$strip>, "done" | "text">>, "query">;
export declare const add: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, "mutation">;
export declare const setDone: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
    done: z.ZodBoolean;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, "mutation">;
