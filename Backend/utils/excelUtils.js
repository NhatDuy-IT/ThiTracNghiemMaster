const Excel = require('excel4node');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Tạo template Excel cho việc nhập câu hỏi
async function generateQuestionTemplate() {
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet('Questions');

    // Định nghĩa style cho header
    const headerStyle = wb.createStyle({
        font: {
            bold: true,
            color: 'FFFFFF',
            size: 12
        },
        fill: {
            type: 'solid',
            color: '137FEC'
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center'
        },
        border: {
            left: {
                style: 'thin'
            },
            right: {
                style: 'thin'
            },
            top: {
                style: 'thin'
            },
            bottom: {
                style: 'thin'
            }
        }
    });

    const dataStyle = wb.createStyle({
        border: {
            left: {
                style: 'thin'
            },
            right: {
                style: 'thin'
            },
            top: {
                style: 'thin'
            },
            bottom: {
                style: 'thin'
            }
        },
        alignment: {
            horizontal: 'left',
            vertical: 'center',
            wrapText: true
        }
    });

    // Các tiêu đề cột
    const headers = [
        'SubjectID', 'QuestionText', 'OptionA', 'OptionB', 
        'OptionC', 'OptionD', 'CorrectAnswer', 'Explanation'
    ];

    headers.forEach((header, index) => {
        ws.cell(1, index + 1).string(header).style(headerStyle);
    });

    // Thiết lập độ rộng cột
    ws.column(1).setWidth(12);  
    ws.column(2).setWidth(30);  
    ws.column(3).setWidth(20); 
    ws.column(4).setWidth(20);  
    ws.column(5).setWidth(20);  
    ws.column(6).setWidth(20);  
    ws.column(7).setWidth(15);  
    ws.column(8).setWidth(25);  
    const samples = [
        [1, 'Thủ đô của Việt Nam là gì?', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'A', 'Hà Nội là thủ đô của Việt Nam'],
        [1, '2 + 2 = ?', '3', '4', '5', '6', 'B', '2 cộng 2 bằng 4'],
        [2, 'Python là gì?', 'Một con rắn', 'Một ngôn ngữ lập trình', 'Một thành phố', 'Một loại trái cây', 'B', 'Python là một ngôn ngữ lập trình mạnh mẽ']
    ];

    samples.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            ws.cell(rowIndex + 2, colIndex + 1).string(String(cell)).style(dataStyle);
        });
    });

    return wb;
}

// Phân tích file Excel và trích xuất câu hỏi
async function parseQuestionsFromExcel(fileBuffer) {
    const results = {
        success: true,
        data: [],
        errors: [],
        summary: {
            total: 0,
            imported: 0,
            failed: 0
        }
    };

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            results.success = false;
            results.errors.push('Không tìm thấy sheet nào trong file');
            return results;
        }

        // Lấy headers từ dòng đầu tiên
        const headers = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
            headers[colNumber - 1] = cell.value;
        });

        const requiredColumns = ['SubjectID', 'QuestionText', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
            results.success = false;
            results.errors.push(`Thiếu cột bắt buộc: ${missingColumns.join(', ')}`);
            return results;
        }

        // Tìm chỉ số cột
        const columnIndices = {
            subjectId: headers.indexOf('SubjectID') + 1,
            questionText: headers.indexOf('QuestionText') + 1,
            optionA: headers.indexOf('OptionA') + 1,
            optionB: headers.indexOf('OptionB') + 1,
            optionC: headers.indexOf('OptionC') + 1,
            optionD: headers.indexOf('OptionD') + 1,
            correctAnswer: headers.indexOf('CorrectAnswer') + 1,
            explanation: headers.indexOf('Explanation') + 1
        };

        // Parse data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            try {
                const question = {
                    subjectId: row.getCell(columnIndices.subjectId).value,
                    questionText: row.getCell(columnIndices.questionText).value,
                    optionA: row.getCell(columnIndices.optionA).value,
                    optionB: row.getCell(columnIndices.optionB).value,
                    optionC: row.getCell(columnIndices.optionC).value,
                    optionD: row.getCell(columnIndices.optionD).value,
                    correctAnswer: String(row.getCell(columnIndices.correctAnswer).value || '').toUpperCase(),
                    explanation: row.getCell(columnIndices.explanation).value || ''
                };

                // Xác thực dữ liệu
                const errors = [];

                if (!question.subjectId || isNaN(question.subjectId)) {
                    errors.push('SubjectID không hợp lệ');
                }
                if (!question.questionText || String(question.questionText).trim() === '') {
                    errors.push('QuestionText không được để trống');
                }
                if (!question.optionA || String(question.optionA).trim() === '') {
                    errors.push('OptionA không được để trống');
                }
                if (!question.optionB || String(question.optionB).trim() === '') {
                    errors.push('OptionB không được để trống');
                }
                if (!question.optionC || String(question.optionC).trim() === '') {
                    errors.push('OptionC không được để trống');
                }
                if (!question.optionD || String(question.optionD).trim() === '') {
                    errors.push('OptionD không được để trống');
                }
                if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
                    errors.push(`CorrectAnswer phải là A, B, C hoặc D (nhận được: ${question.correctAnswer})`);
                }

                results.summary.total++;

                if (errors.length > 0) {
                    results.summary.failed++;
                    results.errors.push({
                        row: rowNumber,
                        errors: errors,
                        data: question
                    });
                } else {
                    results.summary.imported++;
                    results.data.push(question);
                }
            } catch (error) {
                results.summary.total++;
                results.summary.failed++;
                results.errors.push({
                    row: rowNumber,
                    errors: [error.message],
                    data: null
                });
            }
        });

    } catch (error) {
        results.success = false;
        results.errors.push(`Lỗi đọc file Excel: ${error.message}`);
    }

    return results;
}

module.exports = {
    generateQuestionTemplate,
    parseQuestionsFromExcel
};
