"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadResponseDto = exports.UploadType = void 0;
var UploadType;
(function (UploadType) {
    UploadType["IMAGE"] = "image";
    UploadType["DOCUMENT"] = "document";
    UploadType["EXCEL"] = "excel";
    UploadType["VIDEO"] = "video";
})(UploadType || (exports.UploadType = UploadType = {}));
class UploadResponseDto {
    url;
    filename;
    size;
    mimetype;
}
exports.UploadResponseDto = UploadResponseDto;
//# sourceMappingURL=upload.dto.js.map