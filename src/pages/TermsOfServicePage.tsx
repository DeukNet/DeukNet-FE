import { Link } from 'react-router-dom';

export const TermsOfServicePage = () => {
  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div className="box">
        <div className="box-header">DeukNet 이용약관</div>
        <div className="box-content" style={{ lineHeight: '1.8', color: '#e0e0e0' }}>
          <p style={{ marginBottom: '20px', color: '#999', fontSize: '14px' }}>
            최종 수정일: {new Date().toLocaleDateString('ko-KR')}
          </p>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제1조 (목적)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              본 약관은 DeukNet(이하 "본 서비스")가 제공하는 온라인 커뮤니티 서비스의 이용과 관련하여
              서비스 제공자와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제2조 (서비스의 제공 및 변경)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              1. 본 서비스는 게시판, 댓글, 파일 업로드 등의 기능을 제공합니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              2. 본 서비스는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있으며,
              변경 전 해당 내용을 서비스 내에 공지합니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              3. 본 서비스는 무료로 제공되는 서비스이며, 언제든지 서비스의 전부 또는 일부를
              제한하거나 중단할 수 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제3조 (이용자의 의무)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              1. 이용자는 다음 행위를 하여서는 안 됩니다:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>타인의 정보 도용, 허위 정보 등록</li>
              <li>음란물, 불법 정보, 타인의 명예를 훼손하는 내용의 게시</li>
              <li>서비스의 안정적 운영을 방해하는 행위</li>
              <li>본 서비스의 정보를 이용한 영리 행위</li>
              <li>저작권 등 타인의 권리를 침해하는 내용의 게시</li>
              <li>법령에 위배되는 내용의 게시 또는 행위</li>
            </ul>
            <p style={{ marginBottom: '10px' }}>
              2. 이용자는 관계 법령, 본 약관, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제4조 (게시물의 관리)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              1. 이용자가 작성한 게시물에 대한 모든 권리와 책임은 게시자 본인에게 있습니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              2. 본 서비스는 다음 각 호에 해당하는 게시물을 사전 통지 없이 삭제하거나 이동할 수 있습니다:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>타인을 비방하거나 명예를 훼손하는 내용</li>
              <li>음란물, 폭력적이거나 혐오스러운 내용</li>
              <li>범죄적 행위에 결부된다고 인정되는 내용</li>
              <li>타인의 저작권 등 권리를 침해하는 내용</li>
              <li>본 서비스에서 규정한 게시 원칙에 어긋나는 내용</li>
              <li>기타 관계 법령에 위배되는 내용</li>
            </ul>
            <p style={{ marginBottom: '10px' }}>
              3. 본 서비스는 게시물의 내용에 대해 사전 검토 의무가 없으며, 게시물로 인한 법적 책임은
              게시자 본인에게 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제5조 (면책 조항)
            </h2>
            <p style={{ marginBottom: '10px', fontWeight: 'bold', color: '#ffcc00' }}>
              ⚠️ 중요: 다음 면책 조항을 반드시 확인하시기 바랍니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              1. 본 서비스는 무료로 제공되는 서비스로, 천재지변, 전쟁, 기간통신사업자의 서비스 중지,
              해킹, 시스템 장애 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 서비스 제공에 대한
              책임이 면제됩니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              2. 본 서비스는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              3. 본 서비스는 이용자가 게시한 정보, 자료, 사실의 신뢰도, 정확성 등에 대해서는
              책임을 지지 않으며, 이용자 간 또는 이용자와 제3자 간의 분쟁에 개입할 의무가 없습니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              4. 본 서비스는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못하거나 서비스를 통해
              얻은 자료로 인한 손해에 대해 책임을 지지 않습니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              5. 본 서비스는 이용자 상호간 또는 이용자와 제3자 간에 서비스를 매개로 발생한 분쟁에
              대해 개입할 의무가 없으며 이로 인한 손해를 배상할 책임도 없습니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              6. 본 서비스에서 제공하는 정보는 참고용일 뿐이며, 이를 이용한 투자, 계약 등
              어떠한 의사결정에 대해서도 본 서비스는 책임을 지지 않습니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              7. 본 서비스는 이용자가 게시물로 인해 발생하는 명예훼손, 저작권 침해 등 법적 분쟁에
              대해 책임을 지지 않으며, 모든 법적 책임은 게시자 본인에게 귀속됩니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              8. 본 서비스는 예고 없이 서비스의 전부 또는 일부를 중단, 변경, 종료할 수 있으며,
              이로 인한 손해에 대해 책임을 지지 않습니다.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제6조 (개인정보 보호)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              1. 본 서비스는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              2. 개인정보의 보호 및 이용에 대해서는 관련 법령 및 본 서비스의 개인정보처리방침이 적용됩니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              3. 본 서비스는 OAuth 인증을 통해 최소한의 개인정보만을 수집하며,
              사용자가 게시한 내용은 공개 정보로 취급됩니다.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제7조 (저작권의 귀속)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              1. 이용자가 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              2. 이용자는 본 서비스에 게시물을 게시함으로써 본 서비스가 해당 게시물을 서비스 운영,
              개선, 홍보 목적으로 사용할 수 있도록 비독점적 사용권을 허락한 것으로 간주됩니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              3. 이용자는 서비스를 이용하여 얻은 정보를 가공, 판매하는 등의 상업적 목적으로
              이용할 수 없습니다.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제8조 (분쟁 해결)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              1. 본 서비스와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 준거법으로 합니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              2. 본 서비스와 이용자 간 발생한 분쟁에 대해서는 대한민국 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제9조 (약관의 변경)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              1. 본 서비스는 필요한 경우 관계 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              2. 약관이 변경되는 경우 본 서비스는 변경사항을 시행일자 7일 전부터 공지합니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              3. 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
              제10조 (기타)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              1. 본 약관에 명시되지 않은 사항은 관계 법령 및 상관례에 따릅니다.
            </p>
            <p style={{ marginBottom: '10px' }}>
              2. 본 서비스는 개인 프로젝트로 운영되며, 상업적 목적이 없는 서비스입니다.
            </p>
          </section>

          <div style={{ marginTop: '40px', padding: '20px', background: '#2b2b2b', border: '1px solid #555', borderRadius: '4px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#ffcc00' }}>
              ⚠️ 주요 유의사항
            </p>
            <ul style={{ marginLeft: '20px', fontSize: '14px', color: '#ccc' }}>
              <li>본 서비스는 무료 개인 프로젝트로 제공되며, 서비스의 지속성을 보장하지 않습니다.</li>
              <li>게시물에 대한 모든 법적 책임은 작성자 본인에게 있습니다.</li>
              <li>서비스는 예고 없이 중단되거나 변경될 수 있습니다.</li>
              <li>이용자 간 분쟁에 대해 본 서비스는 개입하지 않습니다.</li>
              <li>게시물로 인한 손해배상 청구는 게시자에게 직접 청구되어야 합니다.</li>
            </ul>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <Link to="/login">
              <button style={{ marginRight: '10px' }}>로그인으로 돌아가기</button>
            </Link>
            <Link to="/">
              <button>홈으로</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
