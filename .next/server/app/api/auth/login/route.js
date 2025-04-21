/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/login/route";
exports.ids = ["app/api/auth/login/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/login/route.ts":
/*!*************************************!*\
  !*** ./app/api/auth/login/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_supabase_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/supabase/server */ \"(rsc)/./lib/supabase/server.ts\");\n/* harmony import */ var _lib_csrf__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/csrf */ \"(rsc)/./lib/csrf.ts\");\n/* harmony import */ var _lib_rate_limit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/rate-limit */ \"(rsc)/./lib/rate-limit.ts\");\n/* harmony import */ var pino__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! pino */ \"(rsc)/./node_modules/pino/pino.js\");\n/* harmony import */ var pino__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(pino__WEBPACK_IMPORTED_MODULE_4__);\n// app/api/auth/login/route.ts\n\n\n\n\n\nconst logger = pino__WEBPACK_IMPORTED_MODULE_4___default()();\nasync function POST(request) {\n    const ip = request.headers.get('x-forwarded-for') || 'unknown';\n    // Rate limiting\n    const { success } = await (0,_lib_rate_limit__WEBPACK_IMPORTED_MODULE_3__.rateLimit)(ip, {\n        max: 5,\n        windowMs: 60 * 1000\n    });\n    if (!success) {\n        logger.warn({\n            ip\n        }, 'Rate limit exceeded');\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Too many requests'\n        }, {\n            status: 429\n        });\n    }\n    try {\n        const body = await request.json();\n        logger.debug({\n            body\n        }, 'Received login request');\n        // CSRF validation with detailed logging\n        const csrfValid = (0,_lib_csrf__WEBPACK_IMPORTED_MODULE_2__.validateCsrfToken)(body.csrfToken);\n        logger.debug({\n            csrfValid,\n            receivedToken: body.csrfToken\n        }, 'CSRF validation result');\n        if (!csrfValid) {\n            logger.warn('Invalid CSRF token');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Invalid CSRF token'\n            }, {\n                status: 400\n            });\n        }\n        const supabase = await (0,_lib_supabase_server__WEBPACK_IMPORTED_MODULE_1__.createClient)();\n        const { data, error } = await supabase.auth.signInWithPassword({\n            email: body.username.includes('@') ? body.username : `${body.username}@example.com`,\n            password: body.password\n        });\n        if (error) throw error;\n        logger.info({\n            userId: data.user?.id\n        }, 'Login successful');\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true\n        });\n    } catch (error) {\n        logger.error({\n            error: error.message\n        }, 'Login failed');\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: error.message || 'Login failed'\n        }, {\n            status: 400\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvbG9naW4vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDhCQUE4QjtBQUNZO0FBQ1U7QUFDTjtBQUNGO0FBQ3JCO0FBRXZCLE1BQU1LLFNBQVNELDJDQUFJQTtBQUVaLGVBQWVFLEtBQUtDLE9BQWdCO0lBQ3pDLE1BQU1DLEtBQUtELFFBQVFFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLHNCQUFzQjtJQUVyRCxnQkFBZ0I7SUFDaEIsTUFBTSxFQUFFQyxPQUFPLEVBQUUsR0FBRyxNQUFNUiwwREFBU0EsQ0FBQ0ssSUFBSTtRQUFFSSxLQUFLO1FBQUdDLFVBQVUsS0FBSztJQUFLO0lBQ3RFLElBQUksQ0FBQ0YsU0FBUztRQUNaTixPQUFPUyxJQUFJLENBQUM7WUFBRU47UUFBRyxHQUFHO1FBQ3BCLE9BQU9SLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFvQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUN6RTtJQUVBLElBQUk7UUFDRixNQUFNQyxPQUFPLE1BQU1YLFFBQVFRLElBQUk7UUFDL0JWLE9BQU9jLEtBQUssQ0FBQztZQUFFRDtRQUFLLEdBQUc7UUFFdkIsd0NBQXdDO1FBQ3hDLE1BQU1FLFlBQVlsQiw0REFBaUJBLENBQUNnQixLQUFLRyxTQUFTO1FBQ2xEaEIsT0FBT2MsS0FBSyxDQUFDO1lBQUVDO1lBQVdFLGVBQWVKLEtBQUtHLFNBQVM7UUFBQyxHQUFHO1FBRTNELElBQUksQ0FBQ0QsV0FBVztZQUNkZixPQUFPUyxJQUFJLENBQUM7WUFDWixPQUFPZCxxREFBWUEsQ0FBQ2UsSUFBSSxDQUFDO2dCQUFFQyxPQUFPO1lBQXFCLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUMxRTtRQUVBLE1BQU1NLFdBQVcsTUFBTXRCLGtFQUFZQTtRQUNuQyxNQUFNLEVBQUV1QixJQUFJLEVBQUVSLEtBQUssRUFBRSxHQUFHLE1BQU1PLFNBQVNFLElBQUksQ0FBQ0Msa0JBQWtCLENBQUM7WUFDN0RDLE9BQU9ULEtBQUtVLFFBQVEsQ0FBQ0MsUUFBUSxDQUFDLE9BQU9YLEtBQUtVLFFBQVEsR0FBRyxHQUFHVixLQUFLVSxRQUFRLENBQUMsWUFBWSxDQUFDO1lBQ25GRSxVQUFVWixLQUFLWSxRQUFRO1FBQ3pCO1FBRUEsSUFBSWQsT0FBTyxNQUFNQTtRQUVqQlgsT0FBTzBCLElBQUksQ0FBQztZQUFFQyxRQUFRUixLQUFLUyxJQUFJLEVBQUVDO1FBQUcsR0FBRztRQUN2QyxPQUFPbEMscURBQVlBLENBQUNlLElBQUksQ0FBQztZQUFFSixTQUFTO1FBQUs7SUFDM0MsRUFBRSxPQUFPSyxPQUFZO1FBQ25CWCxPQUFPVyxLQUFLLENBQUM7WUFBRUEsT0FBT0EsTUFBTW1CLE9BQU87UUFBQyxHQUFHO1FBQ3ZDLE9BQU9uQyxxREFBWUEsQ0FBQ2UsSUFBSSxDQUN0QjtZQUFFQyxPQUFPQSxNQUFNbUIsT0FBTyxJQUFJO1FBQWUsR0FDekM7WUFBRWxCLFFBQVE7UUFBSTtJQUVsQjtBQUNGIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXHBhdWxvXFxPbmVEcml2ZVxcRG9jdW1lbnRvc1xcdmVyY2Vsc3RyZXNzZXItbWFpblxcYXBwXFxhcGlcXGF1dGhcXGxvZ2luXFxyb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcHAvYXBpL2F1dGgvbG9naW4vcm91dGUudHNcclxuaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvbGliL3N1cGFiYXNlL3NlcnZlcidcclxuaW1wb3J0IHsgdmFsaWRhdGVDc3JmVG9rZW4gfSBmcm9tICdAL2xpYi9jc3JmJ1xyXG5pbXBvcnQgeyByYXRlTGltaXQgfSBmcm9tICdAL2xpYi9yYXRlLWxpbWl0J1xyXG5pbXBvcnQgcGlubyBmcm9tICdwaW5vJ1xyXG5cclxuY29uc3QgbG9nZ2VyID0gcGlubygpXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XHJcbiAgY29uc3QgaXAgPSByZXF1ZXN0LmhlYWRlcnMuZ2V0KCd4LWZvcndhcmRlZC1mb3InKSB8fCAndW5rbm93bidcclxuICBcclxuICAvLyBSYXRlIGxpbWl0aW5nXHJcbiAgY29uc3QgeyBzdWNjZXNzIH0gPSBhd2FpdCByYXRlTGltaXQoaXAsIHsgbWF4OiA1LCB3aW5kb3dNczogNjAgKiAxMDAwIH0pXHJcbiAgaWYgKCFzdWNjZXNzKSB7XHJcbiAgICBsb2dnZXIud2Fybih7IGlwIH0sICdSYXRlIGxpbWl0IGV4Y2VlZGVkJylcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVG9vIG1hbnkgcmVxdWVzdHMnIH0sIHsgc3RhdHVzOiA0MjkgfSlcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKClcclxuICAgIGxvZ2dlci5kZWJ1Zyh7IGJvZHkgfSwgJ1JlY2VpdmVkIGxvZ2luIHJlcXVlc3QnKVxyXG4gICAgXHJcbiAgICAvLyBDU1JGIHZhbGlkYXRpb24gd2l0aCBkZXRhaWxlZCBsb2dnaW5nXHJcbiAgICBjb25zdCBjc3JmVmFsaWQgPSB2YWxpZGF0ZUNzcmZUb2tlbihib2R5LmNzcmZUb2tlbilcclxuICAgIGxvZ2dlci5kZWJ1Zyh7IGNzcmZWYWxpZCwgcmVjZWl2ZWRUb2tlbjogYm9keS5jc3JmVG9rZW4gfSwgJ0NTUkYgdmFsaWRhdGlvbiByZXN1bHQnKVxyXG4gICAgXHJcbiAgICBpZiAoIWNzcmZWYWxpZCkge1xyXG4gICAgICBsb2dnZXIud2FybignSW52YWxpZCBDU1JGIHRva2VuJylcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIENTUkYgdG9rZW4nIH0sIHsgc3RhdHVzOiA0MDAgfSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdXBhYmFzZSA9IGF3YWl0IGNyZWF0ZUNsaWVudCgpXHJcbiAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25JbldpdGhQYXNzd29yZCh7XHJcbiAgICAgIGVtYWlsOiBib2R5LnVzZXJuYW1lLmluY2x1ZGVzKCdAJykgPyBib2R5LnVzZXJuYW1lIDogYCR7Ym9keS51c2VybmFtZX1AZXhhbXBsZS5jb21gLFxyXG4gICAgICBwYXNzd29yZDogYm9keS5wYXNzd29yZCxcclxuICAgIH0pXHJcblxyXG4gICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvclxyXG5cclxuICAgIGxvZ2dlci5pbmZvKHsgdXNlcklkOiBkYXRhLnVzZXI/LmlkIH0sICdMb2dpbiBzdWNjZXNzZnVsJylcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSlcclxuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9LCAnTG9naW4gZmFpbGVkJylcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnTG9naW4gZmFpbGVkJyB9LCBcclxuICAgICAgeyBzdGF0dXM6IDQwMCB9XHJcbiAgICApXHJcbiAgfVxyXG59Il0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImNyZWF0ZUNsaWVudCIsInZhbGlkYXRlQ3NyZlRva2VuIiwicmF0ZUxpbWl0IiwicGlubyIsImxvZ2dlciIsIlBPU1QiLCJyZXF1ZXN0IiwiaXAiLCJoZWFkZXJzIiwiZ2V0Iiwic3VjY2VzcyIsIm1heCIsIndpbmRvd01zIiwid2FybiIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImJvZHkiLCJkZWJ1ZyIsImNzcmZWYWxpZCIsImNzcmZUb2tlbiIsInJlY2VpdmVkVG9rZW4iLCJzdXBhYmFzZSIsImRhdGEiLCJhdXRoIiwic2lnbkluV2l0aFBhc3N3b3JkIiwiZW1haWwiLCJ1c2VybmFtZSIsImluY2x1ZGVzIiwicGFzc3dvcmQiLCJpbmZvIiwidXNlcklkIiwidXNlciIsImlkIiwibWVzc2FnZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/login/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/csrf.ts":
/*!*********************!*\
  !*** ./lib/csrf.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createCsrfToken: () => (/* binding */ createCsrfToken),\n/* harmony export */   validateCsrfToken: () => (/* binding */ validateCsrfToken)\n/* harmony export */ });\n/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ \"(rsc)/./node_modules/uuid/dist/esm/v4.js\");\n/* harmony import */ var pino__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pino */ \"(rsc)/./node_modules/pino/pino.js\");\n/* harmony import */ var pino__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pino__WEBPACK_IMPORTED_MODULE_0__);\n// lib/csrf.ts\n\n\nconst logger = pino__WEBPACK_IMPORTED_MODULE_0___default()();\nconst csrfTokens = new Map();\nconst createCsrfToken = ()=>{\n    const token = (0,uuid__WEBPACK_IMPORTED_MODULE_1__[\"default\"])();\n    const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes\n    ;\n    csrfTokens.set(token, {\n        expiresAt\n    });\n    logger.debug({\n        token,\n        expiresAt\n    }, 'CSRF token created');\n    return token;\n};\nconst validateCsrfToken = (token)=>{\n    logger.debug({\n        receivedToken: token\n    }, 'Validating CSRF token');\n    if (!token) {\n        logger.warn('No CSRF token provided');\n        return false;\n    }\n    const storedToken = csrfTokens.get(token);\n    if (!storedToken) {\n        logger.warn('CSRF token not found in store');\n        logger.debug('Current tokens:', Array.from(csrfTokens.keys()));\n        return false;\n    }\n    if (Date.now() > storedToken.expiresAt) {\n        csrfTokens.delete(token);\n        logger.warn('Expired CSRF token');\n        return false;\n    }\n    csrfTokens.delete(token);\n    logger.debug('CSRF token validated successfully');\n    return true;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvY3NyZi50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLGNBQWM7QUFDcUI7QUFDWjtBQUV2QixNQUFNRyxTQUFTRCwyQ0FBSUE7QUFDbkIsTUFBTUUsYUFBYSxJQUFJQztBQUVoQixNQUFNQyxrQkFBa0I7SUFDN0IsTUFBTUMsUUFBUU4sZ0RBQU1BO0lBQ3BCLE1BQU1PLFlBQVlDLEtBQUtDLEdBQUcsS0FBSyxLQUFLLEtBQUssS0FBSyxhQUFhOztJQUUzRE4sV0FBV08sR0FBRyxDQUFDSixPQUFPO1FBQUVDO0lBQVU7SUFDbENMLE9BQU9TLEtBQUssQ0FBQztRQUFFTDtRQUFPQztJQUFVLEdBQUc7SUFFbkMsT0FBT0Q7QUFDVCxFQUFDO0FBRU0sTUFBTU0sb0JBQW9CLENBQUNOO0lBQ2hDSixPQUFPUyxLQUFLLENBQUM7UUFBRUUsZUFBZVA7SUFBTSxHQUFHO0lBRXZDLElBQUksQ0FBQ0EsT0FBTztRQUNWSixPQUFPWSxJQUFJLENBQUM7UUFDWixPQUFPO0lBQ1Q7SUFFQSxNQUFNQyxjQUFjWixXQUFXYSxHQUFHLENBQUNWO0lBRW5DLElBQUksQ0FBQ1MsYUFBYTtRQUNoQmIsT0FBT1ksSUFBSSxDQUFDO1FBQ1paLE9BQU9TLEtBQUssQ0FBQyxtQkFBbUJNLE1BQU1DLElBQUksQ0FBQ2YsV0FBV2dCLElBQUk7UUFDMUQsT0FBTztJQUNUO0lBRUEsSUFBSVgsS0FBS0MsR0FBRyxLQUFLTSxZQUFZUixTQUFTLEVBQUU7UUFDdENKLFdBQVdpQixNQUFNLENBQUNkO1FBQ2xCSixPQUFPWSxJQUFJLENBQUM7UUFDWixPQUFPO0lBQ1Q7SUFFQVgsV0FBV2lCLE1BQU0sQ0FBQ2Q7SUFDbEJKLE9BQU9TLEtBQUssQ0FBQztJQUNiLE9BQU87QUFDVCxFQUFDIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXHBhdWxvXFxPbmVEcml2ZVxcRG9jdW1lbnRvc1xcdmVyY2Vsc3RyZXNzZXItbWFpblxcbGliXFxjc3JmLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGxpYi9jc3JmLnRzXHJcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gJ3V1aWQnXHJcbmltcG9ydCBwaW5vIGZyb20gJ3Bpbm8nXHJcblxyXG5jb25zdCBsb2dnZXIgPSBwaW5vKClcclxuY29uc3QgY3NyZlRva2VucyA9IG5ldyBNYXA8c3RyaW5nLCB7IGV4cGlyZXNBdDogbnVtYmVyIH0+KClcclxuXHJcbmV4cG9ydCBjb25zdCBjcmVhdGVDc3JmVG9rZW4gPSAoKSA9PiB7XHJcbiAgY29uc3QgdG9rZW4gPSB1dWlkdjQoKVxyXG4gIGNvbnN0IGV4cGlyZXNBdCA9IERhdGUubm93KCkgKyAxNSAqIDYwICogMTAwMCAvLyAxNSBtaW51dGVzXHJcbiAgXHJcbiAgY3NyZlRva2Vucy5zZXQodG9rZW4sIHsgZXhwaXJlc0F0IH0pXHJcbiAgbG9nZ2VyLmRlYnVnKHsgdG9rZW4sIGV4cGlyZXNBdCB9LCAnQ1NSRiB0b2tlbiBjcmVhdGVkJylcclxuICBcclxuICByZXR1cm4gdG9rZW5cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlQ3NyZlRva2VuID0gKHRva2VuOiBzdHJpbmcpID0+IHtcclxuICBsb2dnZXIuZGVidWcoeyByZWNlaXZlZFRva2VuOiB0b2tlbiB9LCAnVmFsaWRhdGluZyBDU1JGIHRva2VuJylcclxuICBcclxuICBpZiAoIXRva2VuKSB7XHJcbiAgICBsb2dnZXIud2FybignTm8gQ1NSRiB0b2tlbiBwcm92aWRlZCcpXHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIGNvbnN0IHN0b3JlZFRva2VuID0gY3NyZlRva2Vucy5nZXQodG9rZW4pXHJcbiAgXHJcbiAgaWYgKCFzdG9yZWRUb2tlbikge1xyXG4gICAgbG9nZ2VyLndhcm4oJ0NTUkYgdG9rZW4gbm90IGZvdW5kIGluIHN0b3JlJylcclxuICAgIGxvZ2dlci5kZWJ1ZygnQ3VycmVudCB0b2tlbnM6JywgQXJyYXkuZnJvbShjc3JmVG9rZW5zLmtleXMoKSkpXHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIGlmIChEYXRlLm5vdygpID4gc3RvcmVkVG9rZW4uZXhwaXJlc0F0KSB7XHJcbiAgICBjc3JmVG9rZW5zLmRlbGV0ZSh0b2tlbilcclxuICAgIGxvZ2dlci53YXJuKCdFeHBpcmVkIENTUkYgdG9rZW4nKVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBjc3JmVG9rZW5zLmRlbGV0ZSh0b2tlbilcclxuICBsb2dnZXIuZGVidWcoJ0NTUkYgdG9rZW4gdmFsaWRhdGVkIHN1Y2Nlc3NmdWxseScpXHJcbiAgcmV0dXJuIHRydWVcclxufSJdLCJuYW1lcyI6WyJ2NCIsInV1aWR2NCIsInBpbm8iLCJsb2dnZXIiLCJjc3JmVG9rZW5zIiwiTWFwIiwiY3JlYXRlQ3NyZlRva2VuIiwidG9rZW4iLCJleHBpcmVzQXQiLCJEYXRlIiwibm93Iiwic2V0IiwiZGVidWciLCJ2YWxpZGF0ZUNzcmZUb2tlbiIsInJlY2VpdmVkVG9rZW4iLCJ3YXJuIiwic3RvcmVkVG9rZW4iLCJnZXQiLCJBcnJheSIsImZyb20iLCJrZXlzIiwiZGVsZXRlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/csrf.ts\n");

/***/ }),

/***/ "(rsc)/./lib/rate-limit.ts":
/*!***************************!*\
  !*** ./lib/rate-limit.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   rateLimit: () => (/* binding */ rateLimit)\n/* harmony export */ });\nconst rateLimitMap = new Map();\nasync function rateLimit(identifier, { max = 5, windowMs = 60000 }) {\n    const now = Date.now();\n    const existingData = rateLimitMap.get(identifier);\n    if (!existingData || now - existingData.lastReset > windowMs) {\n        rateLimitMap.set(identifier, {\n            count: 1,\n            lastReset: now\n        });\n        return {\n            success: true,\n            remaining: max - 1\n        };\n    }\n    if (existingData.count < max) {\n        existingData.count += 1;\n        rateLimitMap.set(identifier, existingData);\n        return {\n            success: true,\n            remaining: max - existingData.count\n        };\n    }\n    return {\n        success: false,\n        remaining: 0\n    };\n}\n// Limpeza periódica\nif (true) {\n    setInterval(()=>{\n        const now = Date.now();\n        for (const [key, value] of rateLimitMap.entries()){\n            if (now - value.lastReset > 3600000) {\n                rateLimitMap.delete(key);\n            }\n        }\n    }, 300000); // 5 minutos\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcmF0ZS1saW1pdC50cyIsIm1hcHBpbmdzIjoiOzs7O0FBS0EsTUFBTUEsZUFBZSxJQUFJQztBQU9sQixlQUFlQyxVQUNwQkMsVUFBa0IsRUFDbEIsRUFBRUMsTUFBTSxDQUFDLEVBQUVDLFdBQVcsS0FBTSxFQUF1QztJQUVuRSxNQUFNQyxNQUFNQyxLQUFLRCxHQUFHO0lBQ3BCLE1BQU1FLGVBQWVSLGFBQWFTLEdBQUcsQ0FBQ047SUFFdEMsSUFBSSxDQUFDSyxnQkFBZ0JGLE1BQU1FLGFBQWFFLFNBQVMsR0FBR0wsVUFBVTtRQUM1REwsYUFBYVcsR0FBRyxDQUFDUixZQUFZO1lBQzNCUyxPQUFPO1lBQ1BGLFdBQVdKO1FBQ2I7UUFDQSxPQUFPO1lBQUVPLFNBQVM7WUFBTUMsV0FBV1YsTUFBTTtRQUFFO0lBQzdDO0lBRUEsSUFBSUksYUFBYUksS0FBSyxHQUFHUixLQUFLO1FBQzVCSSxhQUFhSSxLQUFLLElBQUk7UUFDdEJaLGFBQWFXLEdBQUcsQ0FBQ1IsWUFBWUs7UUFDN0IsT0FBTztZQUFFSyxTQUFTO1lBQU1DLFdBQVdWLE1BQU1JLGFBQWFJLEtBQUs7UUFBQztJQUM5RDtJQUVBLE9BQU87UUFBRUMsU0FBUztRQUFPQyxXQUFXO0lBQUU7QUFDeEM7QUFFQSxvQkFBb0I7QUFDcEIsSUFBSSxJQUE2QixFQUFFO0lBQ2pDQyxZQUFZO1FBQ1YsTUFBTVQsTUFBTUMsS0FBS0QsR0FBRztRQUNwQixLQUFLLE1BQU0sQ0FBQ1UsS0FBS0MsTUFBTSxJQUFJakIsYUFBYWtCLE9BQU8sR0FBSTtZQUNqRCxJQUFJWixNQUFNVyxNQUFNUCxTQUFTLEdBQUcsU0FBUztnQkFDbkNWLGFBQWFtQixNQUFNLENBQUNIO1lBQ3RCO1FBQ0Y7SUFDRixHQUFHLFNBQVMsWUFBWTtBQUMxQiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxwYXVsb1xcT25lRHJpdmVcXERvY3VtZW50b3NcXHZlcmNlbHN0cmVzc2VyLW1haW5cXGxpYlxccmF0ZS1saW1pdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgUmF0ZUxpbWl0RGF0YSB7XHJcbiAgY291bnQ6IG51bWJlcjtcclxuICBsYXN0UmVzZXQ6IG51bWJlcjtcclxufVxyXG5cclxuY29uc3QgcmF0ZUxpbWl0TWFwID0gbmV3IE1hcDxzdHJpbmcsIFJhdGVMaW1pdERhdGE+KCk7XHJcblxyXG5pbnRlcmZhY2UgUmF0ZUxpbWl0UmVzdWx0IHtcclxuICBzdWNjZXNzOiBib29sZWFuO1xyXG4gIHJlbWFpbmluZz86IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJhdGVMaW1pdChcclxuICBpZGVudGlmaWVyOiBzdHJpbmcsXHJcbiAgeyBtYXggPSA1LCB3aW5kb3dNcyA9IDYwXzAwMCB9OiB7IG1heD86IG51bWJlcjsgd2luZG93TXM/OiBudW1iZXIgfVxyXG4pOiBQcm9taXNlPFJhdGVMaW1pdFJlc3VsdD4ge1xyXG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgY29uc3QgZXhpc3RpbmdEYXRhID0gcmF0ZUxpbWl0TWFwLmdldChpZGVudGlmaWVyKTtcclxuXHJcbiAgaWYgKCFleGlzdGluZ0RhdGEgfHwgbm93IC0gZXhpc3RpbmdEYXRhLmxhc3RSZXNldCA+IHdpbmRvd01zKSB7XHJcbiAgICByYXRlTGltaXRNYXAuc2V0KGlkZW50aWZpZXIsIHtcclxuICAgICAgY291bnQ6IDEsXHJcbiAgICAgIGxhc3RSZXNldDogbm93XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHJlbWFpbmluZzogbWF4IC0gMSB9O1xyXG4gIH1cclxuXHJcbiAgaWYgKGV4aXN0aW5nRGF0YS5jb3VudCA8IG1heCkge1xyXG4gICAgZXhpc3RpbmdEYXRhLmNvdW50ICs9IDE7XHJcbiAgICByYXRlTGltaXRNYXAuc2V0KGlkZW50aWZpZXIsIGV4aXN0aW5nRGF0YSk7XHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCByZW1haW5pbmc6IG1heCAtIGV4aXN0aW5nRGF0YS5jb3VudCB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIHJlbWFpbmluZzogMCB9O1xyXG59XHJcblxyXG4vLyBMaW1wZXphIHBlcmnDs2RpY2FcclxuaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHJhdGVMaW1pdE1hcC5lbnRyaWVzKCkpIHtcclxuICAgICAgaWYgKG5vdyAtIHZhbHVlLmxhc3RSZXNldCA+IDM2MDAwMDApIHsgLy8gMSBob3JhXHJcbiAgICAgICAgcmF0ZUxpbWl0TWFwLmRlbGV0ZShrZXkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSwgMzAwMDAwKTsgLy8gNSBtaW51dG9zXHJcbn0iXSwibmFtZXMiOlsicmF0ZUxpbWl0TWFwIiwiTWFwIiwicmF0ZUxpbWl0IiwiaWRlbnRpZmllciIsIm1heCIsIndpbmRvd01zIiwibm93IiwiRGF0ZSIsImV4aXN0aW5nRGF0YSIsImdldCIsImxhc3RSZXNldCIsInNldCIsImNvdW50Iiwic3VjY2VzcyIsInJlbWFpbmluZyIsInNldEludGVydmFsIiwia2V5IiwidmFsdWUiLCJlbnRyaWVzIiwiZGVsZXRlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/rate-limit.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabase/server.ts":
/*!********************************!*\
  !*** ./lib/supabase/server.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createClient: () => (/* binding */ createClient)\n/* harmony export */ });\n/* harmony import */ var _supabase_ssr__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/ssr */ \"(rsc)/./node_modules/@supabase/ssr/dist/module/index.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\nasync function createClient() {\n    const cookieStore = (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)();\n    return (0,_supabase_ssr__WEBPACK_IMPORTED_MODULE_0__.createServerClient)(\"https://fcabxzdtjiczznyvbyis.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYWJ4emR0amljenpueXZieWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mjg4OTIsImV4cCI6MjA2MDUwNDg5Mn0.t5vS-2AFYGHFSOUQQvh4B78pYXmc2r8APXnoCkbe6Qs\", {\n        cookies: {\n            get (name) {\n                return cookieStore.get(name)?.value;\n            },\n            set (name, value, options) {\n                try {\n                    cookieStore.set({\n                        name,\n                        value,\n                        ...options\n                    });\n                } catch (error) {\n                    console.error('Error setting cookie:', error);\n                }\n            },\n            remove (name, options) {\n                try {\n                    cookieStore.set({\n                        name,\n                        value: '',\n                        ...options\n                    });\n                } catch (error) {\n                    console.error('Error removing cookie:', error);\n                }\n            }\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2Uvc2VydmVyLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFzRTtBQUNoQztBQUcvQixlQUFlRTtJQUNwQixNQUFNQyxjQUFjRixxREFBT0E7SUFFM0IsT0FBT0QsaUVBQWtCQSxDQUN2QkksMENBQW9DLEVBQ3BDQSxrTkFBeUMsRUFDekM7UUFDRUgsU0FBUztZQUNQTyxLQUFJQyxJQUFZO2dCQUNkLE9BQU9OLFlBQVlLLEdBQUcsQ0FBQ0MsT0FBT0M7WUFDaEM7WUFDQUMsS0FBSUYsSUFBWSxFQUFFQyxLQUFhLEVBQUVFLE9BQXNCO2dCQUNyRCxJQUFJO29CQUNGVCxZQUFZUSxHQUFHLENBQUM7d0JBQUVGO3dCQUFNQzt3QkFBTyxHQUFHRSxPQUFPO29CQUFDO2dCQUM1QyxFQUFFLE9BQU9DLE9BQU87b0JBQ2RDLFFBQVFELEtBQUssQ0FBQyx5QkFBeUJBO2dCQUN6QztZQUNGO1lBQ0FFLFFBQU9OLElBQVksRUFBRUcsT0FBc0I7Z0JBQ3pDLElBQUk7b0JBQ0ZULFlBQVlRLEdBQUcsQ0FBQzt3QkFBRUY7d0JBQU1DLE9BQU87d0JBQUksR0FBR0UsT0FBTztvQkFBQztnQkFDaEQsRUFBRSxPQUFPQyxPQUFPO29CQUNkQyxRQUFRRCxLQUFLLENBQUMsMEJBQTBCQTtnQkFDMUM7WUFDRjtRQUNGO0lBQ0Y7QUFFSiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxwYXVsb1xcT25lRHJpdmVcXERvY3VtZW50b3NcXHZlcmNlbHN0cmVzc2VyLW1haW5cXGxpYlxcc3VwYWJhc2VcXHNlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVTZXJ2ZXJDbGllbnQsIHR5cGUgQ29va2llT3B0aW9ucyB9IGZyb20gJ0BzdXBhYmFzZS9zc3InXG5pbXBvcnQgeyBjb29raWVzIH0gZnJvbSAnbmV4dC9oZWFkZXJzJ1xuaW1wb3J0IHsgRGF0YWJhc2UgfSBmcm9tICdAL2xpYi9zdXBhYmFzZS9kYXRhYmFzZS50eXBlcydcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNsaWVudCgpIHtcbiAgY29uc3QgY29va2llU3RvcmUgPSBjb29raWVzKClcbiAgXG4gIHJldHVybiBjcmVhdGVTZXJ2ZXJDbGllbnQ8RGF0YWJhc2U+KFxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCEsXG4gICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkhLFxuICAgIHtcbiAgICAgIGNvb2tpZXM6IHtcbiAgICAgICAgZ2V0KG5hbWU6IHN0cmluZykge1xuICAgICAgICAgIHJldHVybiBjb29raWVTdG9yZS5nZXQobmFtZSk/LnZhbHVlXG4gICAgICAgIH0sXG4gICAgICAgIHNldChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG9wdGlvbnM6IENvb2tpZU9wdGlvbnMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29va2llU3RvcmUuc2V0KHsgbmFtZSwgdmFsdWUsIC4uLm9wdGlvbnMgfSlcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2V0dGluZyBjb29raWU6JywgZXJyb3IpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZW1vdmUobmFtZTogc3RyaW5nLCBvcHRpb25zOiBDb29raWVPcHRpb25zKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvb2tpZVN0b3JlLnNldCh7IG5hbWUsIHZhbHVlOiAnJywgLi4ub3B0aW9ucyB9KVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZW1vdmluZyBjb29raWU6JywgZXJyb3IpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9XG4gIClcbn0iXSwibmFtZXMiOlsiY3JlYXRlU2VydmVyQ2xpZW50IiwiY29va2llcyIsImNyZWF0ZUNsaWVudCIsImNvb2tpZVN0b3JlIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwiZ2V0IiwibmFtZSIsInZhbHVlIiwic2V0Iiwib3B0aW9ucyIsImVycm9yIiwiY29uc29sZSIsInJlbW92ZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase/server.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.ts&appDir=C%3A%5CUsers%5Cpaulo%5COneDrive%5CDocumentos%5Cvercelstresser-main%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cpaulo%5COneDrive%5CDocumentos%5Cvercelstresser-main&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.ts&appDir=C%3A%5CUsers%5Cpaulo%5COneDrive%5CDocumentos%5Cvercelstresser-main%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cpaulo%5COneDrive%5CDocumentos%5Cvercelstresser-main&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_paulo_OneDrive_Documentos_vercelstresser_main_app_api_auth_login_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/login/route.ts */ \"(rsc)/./app/api/auth/login/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/login/route\",\n        pathname: \"/api/auth/login\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/login/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\paulo\\\\OneDrive\\\\Documentos\\\\vercelstresser-main\\\\app\\\\api\\\\auth\\\\login\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_paulo_OneDrive_Documentos_vercelstresser_main_app_api_auth_login_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGbG9naW4lMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkZsb2dpbiUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkZsb2dpbiUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNwYXVsbyU1Q09uZURyaXZlJTVDRG9jdW1lbnRvcyU1Q3ZlcmNlbHN0cmVzc2VyLW1haW4lNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q3BhdWxvJTVDT25lRHJpdmUlNUNEb2N1bWVudG9zJTVDdmVyY2Vsc3RyZXNzZXItbWFpbiZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDNEM7QUFDekg7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXHBhdWxvXFxcXE9uZURyaXZlXFxcXERvY3VtZW50b3NcXFxcdmVyY2Vsc3RyZXNzZXItbWFpblxcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcbG9naW5cXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2F1dGgvbG9naW4vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL2xvZ2luXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL2xvZ2luL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxccGF1bG9cXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRvc1xcXFx2ZXJjZWxzdHJlc3Nlci1tYWluXFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFxsb2dpblxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.ts&appDir=C%3A%5CUsers%5Cpaulo%5COneDrive%5CDocumentos%5Cvercelstresser-main%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cpaulo%5COneDrive%5CDocumentos%5Cvercelstresser-main&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "module":
/*!*************************!*\
  !*** external "module" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("module");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ }),

/***/ "node:os":
/*!**************************!*\
  !*** external "node:os" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:os");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("worker_threads");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/pino","vendor-chunks/whatwg-url","vendor-chunks/fast-redact","vendor-chunks/safe-stable-stringify","vendor-chunks/sonic-boom","vendor-chunks/thread-stream","vendor-chunks/pino-std-serializers","vendor-chunks/cookie","vendor-chunks/webidl-conversions","vendor-chunks/uuid","vendor-chunks/quick-format-unescaped","vendor-chunks/on-exit-leak-free","vendor-chunks/atomic-sleep"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.ts&appDir=C%3A%5CUsers%5Cpaulo%5COneDrive%5CDocumentos%5Cvercelstresser-main%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cpaulo%5COneDrive%5CDocumentos%5Cvercelstresser-main&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();