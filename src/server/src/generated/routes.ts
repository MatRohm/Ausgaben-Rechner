/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SettlesController } from './../modules/settles/SettlesController.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SettlementController } from './../modules/settlement/SettlementController.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PersonsController } from './../modules/persons/PersonsController.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ExpensesController } from './../modules/expenses/ExpensesController.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SystemController } from './../app/SystemController.js';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Settle": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"integer","required":true},
            "name": {"dataType":"string","required":true,"validators":{"minLength":{"value":1}}},
            "createdAt": {"dataType":"string","required":true},
            "closedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "expenseCount": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0}}},
            "totalCents": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "error": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SettleNameInput": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true,"validators":{"minLength":{"value":1}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SettlementBalance": {
        "dataType": "refObject",
        "properties": {
            "personId": {"dataType":"integer","required":true},
            "name": {"dataType":"string","required":true},
            "paidCents": {"dataType":"integer","required":true},
            "owedCents": {"dataType":"integer","required":true},
            "balanceCents": {"dataType":"integer","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SettlementTransfer": {
        "dataType": "refObject",
        "properties": {
            "fromPersonId": {"dataType":"integer","required":true},
            "fromName": {"dataType":"string","required":true},
            "toPersonId": {"dataType":"integer","required":true},
            "toName": {"dataType":"string","required":true},
            "amountCents": {"dataType":"integer","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExpenseParticipant": {
        "dataType": "refObject",
        "properties": {
            "personId": {"dataType":"integer","required":true},
            "weight": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0}}},
            "name": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Expense": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"integer","required":true},
            "description": {"dataType":"string","required":true,"validators":{"minLength":{"value":1}}},
            "amountCents": {"dataType":"integer","required":true,"validators":{"minimum":{"value":1}}},
            "paidById": {"dataType":"integer","required":true},
            "paidByName": {"dataType":"string"},
            "settleId": {"dataType":"integer","required":true},
            "date": {"dataType":"string","required":true},
            "settled": {"dataType":"boolean","required":true},
            "createdAt": {"dataType":"string","required":true},
            "participants": {"dataType":"array","array":{"dataType":"refObject","ref":"ExpenseParticipant"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SettlementResult": {
        "dataType": "refObject",
        "properties": {
            "balances": {"dataType":"array","array":{"dataType":"refObject","ref":"SettlementBalance"},"required":true},
            "transfers": {"dataType":"array","array":{"dataType":"refObject","ref":"SettlementTransfer"},"required":true},
            "settledExpenses": {"dataType":"array","array":{"dataType":"refObject","ref":"Expense"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Person": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"integer","required":true},
            "name": {"dataType":"string","required":true,"validators":{"minLength":{"value":1}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PersonInput": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true,"validators":{"minLength":{"value":1}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExpenseParticipantInput": {
        "dataType": "refObject",
        "properties": {
            "personId": {"dataType":"integer","required":true},
            "weight": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExpenseImportRow": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string","required":true,"validators":{"minLength":{"value":1}}},
            "amountCents": {"dataType":"integer","required":true,"validators":{"minimum":{"value":1}}},
            "date": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^[0-9]{4}-[0-9]{2}(-[0-9]{2})?$"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExpenseImportInput": {
        "dataType": "refObject",
        "properties": {
            "settleId": {"dataType":"integer","required":true},
            "paidById": {"dataType":"integer","required":true},
            "participants": {"dataType":"array","array":{"dataType":"refObject","ref":"ExpenseParticipantInput"},"required":true,"validators":{"minItems":{"value":1}}},
            "expenses": {"dataType":"array","array":{"dataType":"refObject","ref":"ExpenseImportRow"},"required":true,"validators":{"minItems":{"value":1}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExpenseInput": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string","required":true,"validators":{"minLength":{"value":1}}},
            "amountCents": {"dataType":"integer","required":true,"validators":{"minimum":{"value":1}}},
            "paidById": {"dataType":"integer","required":true},
            "settleId": {"dataType":"integer","required":true},
            "date": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^[0-9]{4}-[0-9]{2}(-[0-9]{2})?$"}}},
            "participants": {"dataType":"array","array":{"dataType":"refObject","ref":"ExpenseParticipantInput"},"required":true,"validators":{"minItems":{"value":1}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExpenseSettledInput": {
        "dataType": "refObject",
        "properties": {
            "settled": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Health": {
        "dataType": "refObject",
        "properties": {
            "ok": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"silently-remove-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsSettlesController_list: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/settles',
            ...(fetchMiddlewares<RequestHandler>(SettlesController)),
            ...(fetchMiddlewares<RequestHandler>(SettlesController.prototype.list)),

            async function SettlesController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSettlesController_list, request, response });

                const controller = new SettlesController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSettlesController_create: Record<string, TsoaRoute.ParameterSchema> = {
                input: {"in":"body","name":"input","required":true,"ref":"SettleNameInput"},
        };
        app.post('/api/settles',
            ...(fetchMiddlewares<RequestHandler>(SettlesController)),
            ...(fetchMiddlewares<RequestHandler>(SettlesController.prototype.create)),

            async function SettlesController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSettlesController_create, request, response });

                const controller = new SettlesController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSettlesController_rename: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                input: {"in":"body","name":"input","required":true,"ref":"SettleNameInput"},
        };
        app.patch('/api/settles/:id',
            ...(fetchMiddlewares<RequestHandler>(SettlesController)),
            ...(fetchMiddlewares<RequestHandler>(SettlesController.prototype.rename)),

            async function SettlesController_rename(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSettlesController_rename, request, response });

                const controller = new SettlesController();

              await templateService.apiHandler({
                methodName: 'rename',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSettlesController_close: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.post('/api/settles/:id/close',
            ...(fetchMiddlewares<RequestHandler>(SettlesController)),
            ...(fetchMiddlewares<RequestHandler>(SettlesController.prototype.close)),

            async function SettlesController_close(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSettlesController_close, request, response });

                const controller = new SettlesController();

              await templateService.apiHandler({
                methodName: 'close',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSettlesController_reopen: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.post('/api/settles/:id/reopen',
            ...(fetchMiddlewares<RequestHandler>(SettlesController)),
            ...(fetchMiddlewares<RequestHandler>(SettlesController.prototype.reopen)),

            async function SettlesController_reopen(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSettlesController_reopen, request, response });

                const controller = new SettlesController();

              await templateService.apiHandler({
                methodName: 'reopen',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSettlesController_remove: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/settles/:id',
            ...(fetchMiddlewares<RequestHandler>(SettlesController)),
            ...(fetchMiddlewares<RequestHandler>(SettlesController.prototype.remove)),

            async function SettlesController_remove(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSettlesController_remove, request, response });

                const controller = new SettlesController();

              await templateService.apiHandler({
                methodName: 'remove',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSettlementController_get: Record<string, TsoaRoute.ParameterSchema> = {
                settleId: {"in":"path","name":"settleId","required":true,"dataType":"double"},
        };
        app.get('/api/settlement/:settleId',
            ...(fetchMiddlewares<RequestHandler>(SettlementController)),
            ...(fetchMiddlewares<RequestHandler>(SettlementController.prototype.get)),

            async function SettlementController_get(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSettlementController_get, request, response });

                const controller = new SettlementController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPersonsController_list: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/persons',
            ...(fetchMiddlewares<RequestHandler>(PersonsController)),
            ...(fetchMiddlewares<RequestHandler>(PersonsController.prototype.list)),

            async function PersonsController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPersonsController_list, request, response });

                const controller = new PersonsController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPersonsController_create: Record<string, TsoaRoute.ParameterSchema> = {
                input: {"in":"body","name":"input","required":true,"ref":"PersonInput"},
        };
        app.post('/api/persons',
            ...(fetchMiddlewares<RequestHandler>(PersonsController)),
            ...(fetchMiddlewares<RequestHandler>(PersonsController.prototype.create)),

            async function PersonsController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPersonsController_create, request, response });

                const controller = new PersonsController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPersonsController_rename: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                input: {"in":"body","name":"input","required":true,"ref":"PersonInput"},
        };
        app.patch('/api/persons/:id',
            ...(fetchMiddlewares<RequestHandler>(PersonsController)),
            ...(fetchMiddlewares<RequestHandler>(PersonsController.prototype.rename)),

            async function PersonsController_rename(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPersonsController_rename, request, response });

                const controller = new PersonsController();

              await templateService.apiHandler({
                methodName: 'rename',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPersonsController_remove: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/persons/:id',
            ...(fetchMiddlewares<RequestHandler>(PersonsController)),
            ...(fetchMiddlewares<RequestHandler>(PersonsController.prototype.remove)),

            async function PersonsController_remove(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPersonsController_remove, request, response });

                const controller = new PersonsController();

              await templateService.apiHandler({
                methodName: 'remove',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExpensesController_list: Record<string, TsoaRoute.ParameterSchema> = {
                settleId: {"in":"query","name":"settleId","dataType":"double"},
        };
        app.get('/api/expenses',
            ...(fetchMiddlewares<RequestHandler>(ExpensesController)),
            ...(fetchMiddlewares<RequestHandler>(ExpensesController.prototype.list)),

            async function ExpensesController_list(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExpensesController_list, request, response });

                const controller = new ExpensesController();

              await templateService.apiHandler({
                methodName: 'list',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExpensesController_import: Record<string, TsoaRoute.ParameterSchema> = {
                input: {"in":"body","name":"input","required":true,"ref":"ExpenseImportInput"},
        };
        app.post('/api/expenses/import',
            ...(fetchMiddlewares<RequestHandler>(ExpensesController)),
            ...(fetchMiddlewares<RequestHandler>(ExpensesController.prototype.import)),

            async function ExpensesController_import(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExpensesController_import, request, response });

                const controller = new ExpensesController();

              await templateService.apiHandler({
                methodName: 'import',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExpensesController_create: Record<string, TsoaRoute.ParameterSchema> = {
                input: {"in":"body","name":"input","required":true,"ref":"ExpenseInput"},
        };
        app.post('/api/expenses',
            ...(fetchMiddlewares<RequestHandler>(ExpensesController)),
            ...(fetchMiddlewares<RequestHandler>(ExpensesController.prototype.create)),

            async function ExpensesController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExpensesController_create, request, response });

                const controller = new ExpensesController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExpensesController_update: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                input: {"in":"body","name":"input","required":true,"ref":"ExpenseInput"},
        };
        app.patch('/api/expenses/:id',
            ...(fetchMiddlewares<RequestHandler>(ExpensesController)),
            ...(fetchMiddlewares<RequestHandler>(ExpensesController.prototype.update)),

            async function ExpensesController_update(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExpensesController_update, request, response });

                const controller = new ExpensesController();

              await templateService.apiHandler({
                methodName: 'update',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExpensesController_remove: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/expenses/:id',
            ...(fetchMiddlewares<RequestHandler>(ExpensesController)),
            ...(fetchMiddlewares<RequestHandler>(ExpensesController.prototype.remove)),

            async function ExpensesController_remove(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExpensesController_remove, request, response });

                const controller = new ExpensesController();

              await templateService.apiHandler({
                methodName: 'remove',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExpensesController_setSettled: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                input: {"in":"body","name":"input","required":true,"ref":"ExpenseSettledInput"},
        };
        app.patch('/api/expenses/:id/settled',
            ...(fetchMiddlewares<RequestHandler>(ExpensesController)),
            ...(fetchMiddlewares<RequestHandler>(ExpensesController.prototype.setSettled)),

            async function ExpensesController_setSettled(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExpensesController_setSettled, request, response });

                const controller = new ExpensesController();

              await templateService.apiHandler({
                methodName: 'setSettled',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemController_getHealth: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/health',
            ...(fetchMiddlewares<RequestHandler>(SystemController)),
            ...(fetchMiddlewares<RequestHandler>(SystemController.prototype.getHealth)),

            async function SystemController_getHealth(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemController_getHealth, request, response });

                const controller = new SystemController();

              await templateService.apiHandler({
                methodName: 'getHealth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
