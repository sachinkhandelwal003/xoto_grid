import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { CheckCircleFilled } from "@ant-design/icons";

const Wrapper = styled.div`
  min-height: 90vh;
  background: linear-gradient(135deg, #5c039b, #7b1fa2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: white;
  padding: 50px 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
`;

const IconWrapper = styled.div`
  font-size: 60px;
  color: #5c039b;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin-bottom: 10px;
  font-weight: 700;
`;

const SubText = styled.p`
  color: #666;
  margin-bottom: 30px;
`;

const WaitingApproval = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Card>
        <IconWrapper>
          <CheckCircleFilled />
        </IconWrapper>

        <Title>Registration Submitted</Title>
        <SubText>
          Your account is under admin review. Please wait for approval.
        </SubText>

        <Button
          type="primary"
          size="large"
          style={{
            background: "#5c039b",
            border: "none",
            borderRadius: "10px",
            height: "45px",
            padding: "0 30px"
          }}
          onClick={() => navigate("/")}
        >
          Go to Home
        </Button>
      </Card>
    </Wrapper>
  );
};

export default WaitingApproval;