import { ApiProperty } from '@nestjs/swagger';

export class CommentHistoryDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    oldContent: string;

    @ApiProperty()
    editedAt: Date;

    @ApiProperty()
    status: string;

    @ApiProperty({ nullable: true })
    commentId: number | null;

}
