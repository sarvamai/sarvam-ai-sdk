export type Includes<
	Str extends string,
	Substr extends string,
> = Str extends `${string}${Substr}${string}` ? true : false;

// type Test1 = Includes<"typescript", "script">; // true
// type Test2 = Includes<"typescript", "java">; // false
