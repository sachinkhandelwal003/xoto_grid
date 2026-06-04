import { Card, Typography, Row, Col, Input, DatePicker, Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentCreateVisit(){

  const navigate = useNavigate();
  const { id } = useParams();

  return(
    <div className="p-6">

      <Title level={3}>Schedule Site Visit</Title>

      <Card className="shadow-sm rounded-xl">

        <Row gutter={[16,16]}>

          <Col xs={24} md={12}>
            <Text>Client Name</Text>
            <Input placeholder="Auto-fill later"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Project</Text>
            <Input placeholder="Auto-fill later"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Visit Date</Text>
            <DatePicker style={{width:"100%"}}/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Remarks</Text>
            <Input/>
          </Col>

          <Col span={24}>
            <Button
              type="primary"
              size="large"
              onClick={()=>navigate("/dashboard/agent/site-visits")}
            >
              Save Visit
            </Button>
          </Col>

        </Row>

      </Card>

    </div>
  )
}
